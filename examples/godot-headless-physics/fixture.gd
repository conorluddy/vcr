extends SceneTree

const FIXTURE = preload("res://physics_scene.tscn")
const STEPS := 120

func _initialize() -> void:
	call_deferred("_run")

func _run() -> void:
	var scene := FIXTURE.instantiate()
	root.add_child(scene)
	for _step in range(STEPS):
		await physics_frame

	var floor := scene.get_node("Floor") as StaticBody2D
	var floor_shape := floor.get_node("CollisionShape2D") as CollisionShape2D
	var body := scene.get_node("Body") as RigidBody2D
	var body_shape := body.get_node("CollisionShape2D") as CollisionShape2D
	var floor_size := (floor_shape.shape as RectangleShape2D).size
	var body_size := (body_shape.shape as RectangleShape2D).size
	var position := body.global_position
	var velocity := body.linear_velocity
	if floor_size != Vector2(200, 10) or body_size != Vector2(16, 16):
		push_error("Loaded scene rectangle geometry differs from the fixture contract")
		quit(1)
		return
	if absf(position.x) > 0.01 or absf(position.y - 87.3) > 0.1:
		push_error("Rigid body did not settle on the floor: %s" % position)
		quit(1)
		return
	if absf(velocity.x) > 0.01 or absf(velocity.y) > 0.01:
		push_error("Rigid body still moving after %d steps: %s" % [STEPS, velocity])
		quit(1)
		return

	var output_path := "res://output/state.json"
	var user_args := OS.get_cmdline_user_args()
	if user_args.size() == 2 and user_args[0] == "--output":
		output_path = user_args[1]
	var absolute_path := ProjectSettings.globalize_path(output_path)
	DirAccess.make_dir_recursive_absolute(absolute_path.get_base_dir())
	var result := {
		"godot": Engine.get_version_info().string,
		"physics_frames": STEPS,
		"physics_ticks_per_second": Engine.physics_ticks_per_second,
		"floor_shape": {"type": "RectangleShape2D", "size": [floor_size.x, floor_size.y]},
		"body_shape": {"type": "RectangleShape2D", "size": [body_size.x, body_size.y]},
		"body_position": [snappedf(position.x, 0.0001), snappedf(position.y, 0.0001)],
		"body_velocity": [snappedf(velocity.x, 0.0001), snappedf(velocity.y, 0.0001)]
	}
	var file := FileAccess.open(absolute_path, FileAccess.WRITE)
	if file == null:
		push_error("Could not write result JSON to %s" % absolute_path)
		quit(1)
		return
	file.store_string(JSON.stringify(result, "\t") + "\n")
	file.close()
	print(JSON.stringify({"status": "pass", "result": result}))
	quit(0)
