export const ids_registries = {
    walls: {
        1: 'bricks_1',
        2: 'grass_wall'
    },
    sprites: {
        1: {
            name: 'barrel',
            traversable: false,
            z_axis: -120,
            flat: true,
            size: 10_000,
            frames: {horizontal: 24, vertical: 0},
            degrees_variation: 15,
            is_character: false,
            width: 200,
            height: 200,
            adjusted_angle: -10
        },
        2: {
            name: 'crate',
            traversable: false,
            z_axis: -120,
            flat: false,
            size: 10_000,
            frames: {horizontal: 24, vertical: 0},
            degrees_variation: 15,
            is_character: false,
            width: 200,
            height: 200,
            adjusted_angle: -10
        },
        3: {
            name: 'soldier',
            traversable: true,
            z_axis: -10,
            flat: false,
            size: 30_000,
            frames: {horizontal: 8, vertical: 5},
            degrees_variation: 45,
            is_character: true,
            width: 130,
            height: 130,
            adjusted_angle: -20
        }
    }
}