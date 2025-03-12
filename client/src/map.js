import { Sprite } from "./engine/classes/sprite.js"
import { ids_registries } from "./resources/ids_registries.js"

export let map = null

export const setMap = new_map => { map = new_map}
export const getMap = () => map

export const setMapSprites = (sprites) => {
    for (let y = 0 ; y < map.sprites.length ; y++){
        for (let x = 0 ; x < map.sprites[y].length ; x++){
            const cell_content = map.sprites[y][x]
            if (cell_content !== 0){
                const cell_x = (x * map.grid_offset) + map.grid_offset / 2
                const cell_y = (y * map.grid_offset) + map.grid_offset / 2
                const sprite_data = ids_registries.sprites[cell_content]
                const new_sprite = new Sprite({
                    id: crypto.randomUUID(),
                    type: 'map_sprites',
                    sprite_id: cell_content,
                    position: {x: cell_x, y: cell_y},
                    data: sprite_data
                })
                sprites.push(new_sprite)
            }
        }
    }
}