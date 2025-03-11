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
    last_update: 1
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

export const switch_state = {
    switched: false,
    angle: -1,
    speed: 3
}

export const current_item = {
    name: '',
    image: new Image(),
    frame_width: 0,
    data: {}
}

export const weapon_bobbing = {
    angle: 0,
    speed: 5,
    length: 20
}
