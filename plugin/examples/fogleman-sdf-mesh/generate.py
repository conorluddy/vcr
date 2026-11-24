"""Compose the README classic fogleman/sdf example and save it as binary STL.

Usage: generate.py OUTPUT_STL_PATH
The composition is the README line verbatim; library defaults decide bounds and resolution.
"""
import sys

from sdf import *


def classic_shape():
    f = sphere(1) & box(1.5)
    c = cylinder(0.5)
    f -= c.orient(X) | c.orient(Y) | c.orient(Z)
    return f


if __name__ == '__main__':
    if len(sys.argv) != 2:
        sys.exit('usage: generate.py OUTPUT_STL_PATH')
    classic_shape().save(sys.argv[1])
