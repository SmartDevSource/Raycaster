export const degrees_fov = 60
export const radians_fov = degrees_fov * (Math.PI / 180)
export const screen_resolution = {w: 640, h: 480}
export const width_fov = radians_fov / screen_resolution.w

export const keys = {
    z: false,
    q: false,
    s: false,
    d: false,
}

export const camera = {
    angle: -1.6,
    position: {x: 64, y: 192},
    rotation: {x: -1.6, y: 0},
    max_y_angle: 450,
    speed_move: 300,
    center_dist_ray: {x: 0, y: 0}
}

export const mouse = {
    sensitivity: 1
}

export const clock = {
    delta_time: 0,
    last_update: 0
}