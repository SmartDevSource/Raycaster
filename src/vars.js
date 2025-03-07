export const degrees_fov = 60
export const radians_fov = degrees_fov * (Math.PI / 180)
export const screen_resolution = {w: 640, h: 480}
export const width_fov = radians_fov / screen_resolution.w

export const keys = {
    z: false,
    q: false,
    s: false,
    d: false,
    '+': false,
    '-': false
}

export const mouse = {
    sensitivity: 1
}

export const clock = {
    delta_time: 0,
    last_update: 0
}

export const sparkling = {
    is_active: false,
    next: null,
    times: 0
}