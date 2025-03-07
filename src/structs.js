export const keys = {
    z: false,
    q: false,
    s: false,
    d: false,
    shift: false,
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

export const lighter = {
    intensity: 0,
    treshold: .1,
    fog_factor: 10,
    flickering: {
        value: 0,
        speed: 1,
        min: 0,
        max: .05
    }
}