"""Predeclared checks on a clipped DEM. Usage: check.py <geotiff> <eio-version>"""
import hashlib, json, sys
from osgeo import gdal, osr

BOUNDS = (-4.12, 53.04, -4.03, 53.10)  # left bottom right top, WGS84
SNOWDON = (-4.07635, 53.06846, 1085.0)  # lon, lat, metres (Ordnance Survey summit height)
PIXEL = 1 / 3600
gdal.UseExceptions()

ds = gdal.Open(sys.argv[1])
band = ds.GetRasterBand(1)
data = band.ReadAsArray()
gt = ds.GetGeoTransform()
left, top = gt[0], gt[3]
right, bottom = left + gt[1] * ds.RasterXSize, top + gt[5] * ds.RasterYSize
srs = osr.SpatialReference(wkt=ds.GetProjection())
row, col = divmod(int(data.argmax()), data.shape[1])
peak_lon, peak_lat = left + (col + 0.5) * gt[1], top + (row + 0.5) * gt[5]
nodata = band.GetNoDataValue()
nodata_count = int((data == nodata).sum()) if nodata is not None else 0
metrics = {
    "eio_version": sys.argv[2],
    "size": [ds.RasterXSize, ds.RasterYSize],
    "bounds": [round(v, 6) for v in (left, bottom, right, top)],
    "epsg": srs.GetAuthorityCode(None),
    "max_m": int(data.max()),
    "min_m": int(data.min()),
    "peak_lonlat": [round(peak_lon, 5), round(peak_lat, 5)],
    "nodata_pixels": nodata_count,
    "pixel_sha256": hashlib.sha256(data.tobytes()).hexdigest()[:16],
}
checks = {
    "crs_is_epsg_4326": metrics["epsg"] == "4326" and srs.IsGeographic() == 1,
    "bounds_within_one_pixel": all(abs(a - b) <= PIXEL for a, b in zip(metrics["bounds"], BOUNDS)),
    "bounds_cover_request": left <= BOUNDS[0] and bottom <= BOUNDS[1] and right >= BOUNDS[2] and top >= BOUNDS[3],
    "size_is_325x217": metrics["size"] == [325, 217],
    "max_within_30m_of_summit": abs(metrics["max_m"] - SNOWDON[2]) <= 30,
    "peak_within_0.005deg_of_summit": abs(peak_lon - SNOWDON[0]) <= 0.005 and abs(peak_lat - SNOWDON[1]) <= 0.005,
    "min_plausible_valley_0_to_200m": 0 <= metrics["min_m"] <= 200,
    "no_nodata_pixels": nodata_count == 0,
}
metrics["checks"] = checks
metrics["all_passed"] = all(checks.values())
print(json.dumps(metrics, indent=2, sort_keys=True))
