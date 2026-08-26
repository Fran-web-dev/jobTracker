import math
from pathlib import Path

import bpy
from mathutils import Vector


ROOT = Path(r"D:\Escritorio\game\neon-roads-japan")
EXTRACTED = ROOT / "extracted"
DOWNLOADS = ROOT / "downloads"
OUT = ROOT / "neon_roads_japan.blend"
PREVIEW = ROOT / "neon_roads_japan_preview.png"


def clear():
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.object.delete()


def material(name, base, rough=0.45, metallic=0, alpha=1, emission=None, strength=0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    m.diffuse_color = (*base[:3], alpha)
    bsdf = m.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*base[:3], alpha)
        bsdf.inputs["Roughness"].default_value = rough
        bsdf.inputs["Metallic"].default_value = metallic
        bsdf.inputs["Alpha"].default_value = alpha
        if emission:
            bsdf.inputs["Emission Color"].default_value = (*emission[:3], 1)
            bsdf.inputs["Emission Strength"].default_value = strength
    if alpha < 1:
        m.blend_method = "BLEND"
        m.use_screen_refraction = True
    return m


def texture_material(name, color_path, rough_path=None, normal_path=None):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    bsdf = nt.nodes.get("Principled BSDF")
    tex = nt.nodes.new("ShaderNodeTexImage")
    tex.image = bpy.data.images.load(str(color_path))
    nt.links.new(tex.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.18
    if rough_path and Path(rough_path).exists():
        rough = nt.nodes.new("ShaderNodeTexImage")
        rough.image = bpy.data.images.load(str(rough_path))
        rough.image.colorspace_settings.name = "Non-Color"
        nt.links.new(rough.outputs["Color"], bsdf.inputs["Roughness"])
    if normal_path and Path(normal_path).exists():
        ntex = nt.nodes.new("ShaderNodeTexImage")
        ntex.image = bpy.data.images.load(str(normal_path))
        ntex.image.colorspace_settings.name = "Non-Color"
        nmap = nt.nodes.new("ShaderNodeNormalMap")
        nmap.inputs["Strength"].default_value = 0.35
        nt.links.new(ntex.outputs["Color"], nmap.inputs["Color"])
        nt.links.new(nmap.outputs["Normal"], bsdf.inputs["Normal"])
    return m


def cube(name, loc, scale, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.dimensions = scale
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if mat:
        o.data.materials.append(mat)
    return o


def plane(name, loc, scale, mat):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
    o = bpy.context.object
    o.name = name
    o.scale = scale
    if mat:
        o.data.materials.append(mat)
    return o


def import_glb(path, name, loc, rot_z=0, scale=1):
    if not path.exists():
        return None
    before = set(bpy.context.scene.objects)
    bpy.ops.import_scene.gltf(filepath=str(path))
    objs = [o for o in bpy.context.scene.objects if o not in before]
    empty = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(empty)
    empty.location = loc
    empty.rotation_euler = (0, 0, rot_z)
    empty.scale = (scale, scale, scale)
    for o in objs:
        o.parent = empty
    return empty


def bevel(obj, amount):
    mod = obj.modifiers.new("small bevels", "BEVEL")
    mod.width = amount
    mod.segments = 2
    obj.modifiers.new("weighted normals", "WEIGHTED_NORMAL")


def add_text_sign(text, loc, rot_z, mat, size=0.6):
    curve = bpy.data.curves.new(f"{text} text", "FONT")
    curve.body = text
    curve.align_x = "CENTER"
    curve.align_y = "CENTER"
    curve.size = size
    curve.extrude = 0.025
    obj = bpy.data.objects.new(f"Neon sign {text}", curve)
    bpy.context.collection.objects.link(obj)
    obj.location = loc
    obj.rotation_euler = (math.radians(90), 0, rot_z)
    obj.data.materials.append(mat)
    return obj


def box_sign(name, loc, scale, mat):
    o = cube(name, loc, scale, mat)
    bevel(o, min(scale) * 0.12)
    return o


def area(name, loc, rot, color, power, size):
    l = bpy.data.lights.new(name, "AREA")
    l.energy = power
    l.size = size
    l.color = color
    o = bpy.data.objects.new(name, l)
    bpy.context.collection.objects.link(o)
    o.location = loc
    o.rotation_euler = rot
    return o


def point(name, loc, color, power, radius):
    l = bpy.data.lights.new(name, "POINT")
    l.energy = power
    l.shadow_soft_size = radius
    l.color = color
    o = bpy.data.objects.new(name, l)
    bpy.context.collection.objects.link(o)
    o.location = loc
    return o


def look_at(obj, target):
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def setup_scene():
    scene = bpy.context.scene
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 128
    scene.cycles.use_denoising = True
    scene.view_settings.view_transform = "Filmic"
    scene.view_settings.look = "High Contrast"
    scene.view_settings.exposure = -0.4
    scene.view_settings.gamma = 1
    scene.eevee.taa_render_samples = 64
    scene.render.resolution_x = 1600
    scene.render.resolution_y = 900
    scene.world.color = (0.006, 0.009, 0.016)
    scene.unit_settings.system = "METRIC"


def build():
    clear()
    setup_scene()

    asphalt = texture_material(
        "Poly Haven Asphalt 02 - wet dark",
        DOWNLOADS / "polyhaven_asphalt_02_2k" / "asphalt_02_diff_2k.jpg",
        DOWNLOADS / "polyhaven_asphalt_02_2k" / "asphalt_02_rough_2k.jpg",
        DOWNLOADS / "polyhaven_asphalt_02_2k" / "asphalt_02_nor_gl_2k.exr",
    )
    road_dark = material("wet black reflective asphalt", (0.006, 0.007, 0.008), rough=0.055)
    concrete = material("aged concrete sidewalk", (0.24, 0.235, 0.22), rough=0.76)
    building_mats = [
        material("off white plaster", (0.72, 0.70, 0.65), rough=0.62),
        material("charcoal tile facade", (0.08, 0.085, 0.09), rough=0.5),
        material("brown brick facade", (0.36, 0.18, 0.13), rough=0.65),
        material("weathered blue facade", (0.14, 0.22, 0.28), rough=0.58),
    ]
    glass = material("dark glass", (0.02, 0.035, 0.05), rough=0.08, alpha=0.62)
    paper = material("warm paper lantern", (1.0, 0.48, 0.16), rough=0.5, emission=(1.0, 0.28, 0.07), strength=2.8)
    vending_blue = material("vending machine glow blue", (0.05, 0.15, 0.25), rough=0.35, emission=(0.0, 0.45, 1.0), strength=3.0)
    vending_red = material("vending machine glow red", (0.35, 0.02, 0.02), rough=0.35, emission=(1.0, 0.04, 0.02), strength=2.4)
    white = material("road marking paint", (0.9, 0.86, 0.72), rough=0.4)
    yellow = material("warm lane paint", (1.0, 0.72, 0.08), rough=0.35)
    metal = material("dark metal", (0.025, 0.028, 0.031), rough=0.32, metallic=0.6)
    neon_pink = material("neon magenta", (1, 0.05, 0.35), emission=(1, 0.02, 0.18), strength=10)
    neon_cyan = material("neon cyan", (0.0, 0.85, 1), emission=(0, 0.75, 1), strength=9)
    neon_warm = material("neon amber", (1, 0.56, 0.08), emission=(1, 0.42, 0.04), strength=8)
    neon_green = material("konbini green", (0.1, 1, 0.28), emission=(0.1, 1, 0.25), strength=7)

    plane("asphalt textured base", (0, 0, -0.01), (8.0, 34, 1), asphalt)
    plane("wet reflective road layer", (0, 0, 0.005), (2.45, 34, 1), road_dark)
    cube("left narrow sidewalk", (-3.0, 0, 0.12), (1.65, 34, 0.24), concrete)
    cube("right narrow sidewalk", (3.0, 0, 0.12), (1.65, 34, 0.24), concrete)

    for y in range(-28, 30, 4):
        cube("center dashed lane", (0, y, 0.035), (0.08, 1.8, 0.018), yellow)
    for x in (-1.8, 1.8):
        cube("edge line", (x, 0, 0.036), (0.045, 62, 0.018), white)
    for y in (-12, 2, 14):
        for i in range(8):
            cube("zebra crossing stripe", (-1.55 + i * 0.45, y, 0.04), (0.26, 2.0, 0.015), white)

    road_dir = EXTRACTED / "kenney_city-kit-roads" / "Models" / "GLB format"
    car_dir = EXTRACTED / "kenney_car-kit" / "Models" / "GLB format"
    for y in (-14, -8, -2, 4, 10, 16):
        import_glb(road_dir / "light-square.glb", f"left street lamp {y}", (-2.35, y, 0.25), scale=0.75)
        import_glb(road_dir / "light-square.glb", f"right street lamp {y}", (2.35, y + 1.7, 0.25), math.radians(180), 0.75)
        point(f"lamp glow {y}", (-2.35, y, 4.0), (1.0, 0.72, 0.42), 165, 2.4)
        point(f"lamp glow r {y}", (2.35, y + 1.7, 4.0), (0.72, 0.86, 1.0), 125, 2.4)

    heights = [5.2, 7.6, 4.4, 8.8, 6.2, 5.7, 9.2, 4.8, 6.8, 7.2]
    for i, y in enumerate(range(-24, 24, 4)):
        for side, x, rot in (("L", -4.35, math.radians(90)), ("R", 4.35, math.radians(-90))):
            h = heights[(i + (0 if side == "L" else 2)) % len(heights)]
            depth = 1.95 + (i % 3) * 0.28
            b = cube(f"{side} close japanese facade {i}", (x, y, h / 2), (depth, 3.6, h), building_mats[i % len(building_mats)])
            bevel(b, 0.035)
            for floor in range(1, int(h // 1.35)):
                for col in (-0.75, 0, 0.75):
                    wx = x + (-depth / 2 - 0.015 if side == "L" else depth / 2 + 0.015)
                    win = cube(f"{side} window {i}-{floor}-{col}", (wx, y + col * 1.6, floor * 1.25 + 0.55), (0.035, 0.62, 0.42), glass)
                    if side == "R":
                        win.location.x = x - depth / 2 - 0.015
            face_x = x + (-depth / 2 - 0.03 if side == "L" else depth / 2 + 0.03)
            if side == "R":
                face_x = x - depth / 2 - 0.03
            store = cube(f"{side} storefront glow {i}", (face_x, y, 1.08), (0.055, 2.35, 1.05), [neon_cyan, neon_pink, neon_warm, neon_green][i % 4])
            if side == "R":
                store.location.x = x - depth / 2 - 0.03
            awning = cube(f"{side} fabric awning {i}", (face_x, y, 2.05), (0.28, 2.6, 0.18), [neon_pink, neon_cyan, neon_warm, neon_green][(i + 1) % 4])
            if side == "R":
                awning.location.x = x - depth / 2 - 0.22

            if i % 2 == 0:
                panel_y = y - 1.15
                box_sign(f"{side} vertical lightbox {i}", (face_x, panel_y, 3.15), (0.18, 0.5, 1.9), [neon_pink, neon_cyan, neon_warm, neon_green][i % 4])
                add_text_sign(["酒", "駅", "焼鳥", "寿司"][i % 4], (face_x + (-0.12 if side == "L" else 0.12), panel_y, 3.16), rot, [neon_pink, neon_cyan, neon_warm, neon_green][i % 4], 0.34)

    sign_specs = [
        ("ラーメン", (-3.25, -13, 3.4), math.radians(90), neon_pink, 0.55),
        ("コンビニ", (3.25, -6, 3.2), math.radians(-90), neon_green, 0.48),
        ("居酒屋", (-3.25, 3, 4.1), math.radians(90), neon_cyan, 0.42),
        ("ホテル", (3.25, 10, 4.4), math.radians(-90), neon_warm, 0.42),
    ]
    for text, loc, rz, m, size in sign_specs:
        add_text_sign(text, loc, rz, m, size)

    for x in (-2.72, 2.72):
        for y in range(-22, 23, 4):
            pole = cube("utility pole", (x, y, 2.2), (0.08, 0.08, 4.4), metal)
            bevel(pole, 0.02)
    wire_mat = material("overhead cable", (0.005, 0.005, 0.006), rough=0.25)
    for x in (-2.72, 2.72):
        for z in (3.8, 4.15):
            cube("overhead wire", (x, 0, z), (0.035, 42, 0.035), wire_mat)
    for y in range(-20, 22, 5):
        cube("cross street cable", (0, y, 4.25), (5.4, 0.025, 0.025), wire_mat)

    for side, x in (("L", -2.55), ("R", 2.55)):
        for i, y in enumerate([-17, -9, -1, 7, 15]):
            vm = cube(f"{side} vending machine {i}", (x, y, 0.95), (0.32, 0.75, 1.75), vending_blue if i % 2 == 0 else vending_red)
            bevel(vm, 0.025)
            cube(f"{side} vending lit panel {i}", (x + (-0.17 if side == "L" else 0.17), y, 1.18), (0.025, 0.48, 0.82), glass)
        for y in [-12, -6, 2, 12]:
            bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=0.18, location=(x, y, 2.2))
            lantern = bpy.context.object
            lantern.name = f"{side} paper lantern {y}"
            lantern.scale.z = 1.35
            lantern.data.materials.append(paper)
            point(f"{side} lantern glow {y}", (x, y, 2.2), (1.0, 0.34, 0.08), 45, 1.1)

    vehicle_specs = [
        ("race.glb", "lead street racer", (0.72, -15, 0.18), 0, 1.15),
        ("police.glb", "pursuit police", (-0.72, -19, 0.18), 0, 1.15),
        ("taxi.glb", "japan taxi", (1.1, 7, 0.18), math.radians(180), 1.0),
        ("van.glb", "delivery van", (-1.05, 14, 0.18), math.radians(180), 1.0),
    ]
    for f, n, loc, rz, s in vehicle_specs:
        import_glb(car_dir / f, n, loc, rz, s)

    for y in (-2.5, 0.5, 18):
        import_glb(road_dir / "construction-cone.glb", f"cone {y}", (-1.55, y, 0.2), scale=0.7)
        import_glb(road_dir / "construction-barrier.glb", f"barrier {y}", (1.65, y + 1, 0.2), math.radians(90), 0.8)

    area("long wet road reflection", (0, -7, 5.2), (math.radians(72), 0, 0), (0.2, 0.65, 1.0), 620, 5.2)
    area("pink shop spill", (-3.8, -13, 2.7), (0, math.radians(90), 0), (1, 0.05, 0.28), 650, 3)
    area("green shop spill", (3.8, -6, 2.7), (0, math.radians(-90), 0), (0.1, 1, 0.25), 450, 3)
    point("police blue", (-1.1, -18.6, 1.3), (0, 0.2, 1), 380, 1.8)
    point("police red", (-0.25, -18.6, 1.3), (1, 0.02, 0.02), 340, 1.8)

    bpy.ops.object.camera_add(location=(0.35, -25.0, 2.35))
    cam = bpy.context.object
    bpy.context.scene.camera = cam
    cam.name = "Street-level cinematic camera"
    look_at(cam, (0.0, -4.0, 1.25))
    cam.data.lens = 25
    cam.data.dof.use_dof = True
    cam.data.dof.focus_distance = 12
    cam.data.dof.aperture_fstop = 3.5

    bpy.ops.wm.save_as_mainfile(filepath=str(OUT))
    bpy.context.scene.render.filepath = str(PREVIEW)
    bpy.ops.render.render(write_still=True)


if __name__ == "__main__":
    build()
