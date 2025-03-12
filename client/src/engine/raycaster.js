import { camera } from './camera.js'
import { map, getMapSprites } from '../map.js'
import { draw2dLine, drawCircle, drawHud } from './draw.js'
import { images } from '../resources/images.js'
import { clock, sparkling, lighter } from '../structs.js'
import { inputListener } from '../input_handler.js'
import { loadResources } from '../resources/resources_handler.js'
import { ids_registries } from '../resources/ids_registries.js'
import { Player } from './classes/player.js'

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const degrees_fov = 60
const radians_fov = degrees_fov * (Math.PI / 180)
const screen_resolution = {w: 640, h: 480}
const width_fov = radians_fov / screen_resolution.w
canvas.width = screen_resolution.w
canvas.height = screen_resolution.h
const half_screen = {x: canvas.width / 2, y: canvas.height / 2}

const floor_height = 750
const z_buffer = new Array(canvas.width)

const sprites = getMapSprites()
const current_item = 'lighter'

const player_test = new Player({
    id: crypto.randomUUID(),
    position: {x: 120, y: 400},
    angle: 0
})
sprites.push(player_test.sprite)

console.log("sprites", sprites)

let test_output = ''

const draw2dMap = () => {
    ctx.save()
    ctx.scale(.2, .2)
    for (let y = 0 ; y < map.walls.length ; y++){
        for (let x = 0 ; x < map.walls[y].length ; x++){
            if (map.walls[y][x] !== 0){
                ctx.strokeStyle = 'white'
                ctx.lineWidth = 5
                ctx.strokeRect(
                    (x * map.grid_offset),
                    (y * map.grid_offset),
                    map.grid_offset,
                    map.grid_offset
                )
            }
        }
    }
    drawCircle(
        ctx,
        camera.position,
        10,
        'lime'
    )
    draw2dLine(
        ctx,
        camera.position,
        camera.center_dist_ray,
        5,
        'red'
    )
    ctx.restore()
}
const drawSky = () => {
    const skybox = images.skyboxes[map.skybox].img
    const sky_width = skybox.width
    const sky_height = skybox.height

    const offset = {
        x: (-camera.rotation.x / Math.PI) * sky_width, 
        y: -(sky_height / 2) + camera.rotation.y
    }
    offset.x = (offset.x % sky_width + sky_width) % sky_width
    
    ctx.drawImage(skybox, offset.x, offset.y)

    if (offset.x > 0) {
        ctx.drawImage(skybox, (offset.x + 1) - sky_width, offset.y)
    } else {
        ctx.drawImage(skybox, offset.x + sky_width, offset.y)
    }
}
const drawFloor = () => {
    const start_y = (canvas.height / 2) + camera.rotation.y
    const floor_gradient = ctx.createLinearGradient(0, start_y, 0, start_y + 255)
    floor_gradient.addColorStop(0, map.floor_gradient.far_dark)
    const light_factor = parseInt(lighter.flickering.value * 100)
    const close_floor_color = current_item === 'lighter' ? `
        rgb(
            ${map.floor_gradient.close_light.r + light_factor},
            ${map.floor_gradient.close_light.g + light_factor},
            ${map.floor_gradient.close_light.b + light_factor}
        )
    ` :
    `
        rgb(
            ${map.floor_gradient.close_dark.r},
            ${map.floor_gradient.close_dark.g},
            ${map.floor_gradient.close_dark.b}
        )
    `
    floor_gradient.addColorStop(1, sparkling.is_active ? "#4c3321" : close_floor_color)
    ctx.fillStyle = floor_gradient
    ctx.fillRect(
        0,
        start_y,
        canvas.width,
        floor_height
    )
}
const projectCamera = () => {
    for (let w = 0; w <= canvas.width; w++) {
        const ray_angle = camera.rotation.x + radians_fov / 2 - w * width_fov
        const ray_dir_x = Math.cos(ray_angle)
        const ray_dir_y = Math.sin(ray_angle)

        let map_x = Math.floor(camera.position.x / map.grid_offset)
        let map_y = Math.floor(camera.position.y / map.grid_offset)

        const delta_dist_x = Math.abs(1 / ray_dir_x)
        const delta_dist_y = Math.abs(1 / ray_dir_y)

        let step_x, step_y
        let side_dist_x, side_dist_y

        if (ray_dir_x < 0){
            step_x = -1
            side_dist_x = (camera.position.x / map.grid_offset - map_x) * delta_dist_x
        } else {
            step_x = 1
            side_dist_x = (map_x + 1 - camera.position.x / map.grid_offset) * delta_dist_x
        }
        if (ray_dir_y < 0){
            step_y = -1
            side_dist_y = (camera.position.y / map.grid_offset - map_y) * delta_dist_y
        } else {
            step_y = 1
            side_dist_y = (map_y + 1 - camera.position.y / map.grid_offset) * delta_dist_y
        }

        let hit = false
        let side = 0
        let tile_content = ''

        while (!hit){
            if (side_dist_x < side_dist_y){
                side_dist_x += delta_dist_x
                map_x += step_x
                side = 0
            } else {
                side_dist_y += delta_dist_y
                map_y += step_y
                side = 1
            }
            if (map.walls[map_y][map_x] != 0){
                const wall_data = map.walls[map_y][map_x]
                tile_content = ids_registries.walls[wall_data]
                hit = true
            }
        }

        const perp_wall_dist = (side === 0) ?
            ((map_x - camera.position.x / map.grid_offset) + (1 - step_x) / 2) / ray_dir_x :
            ((map_y - camera.position.y / map.grid_offset) + (1 - step_y) / 2) / ray_dir_y

        const corrected_distance = perp_wall_dist * Math.cos(ray_angle - camera.rotation.x)

        const x_wall = (canvas.width - w)
        const height_projection = (canvas.height / corrected_distance) * 1
        const top_wall = (half_screen.y - height_projection) + camera.rotation.y
        const bottom_wall = (half_screen.y + height_projection) + camera.rotation.y

        let texture_offset = (side === 0) ?
            (camera.position.y / map.grid_offset + perp_wall_dist * ray_dir_y) % 1 :
            (camera.position.x / map.grid_offset + perp_wall_dist * ray_dir_x) % 1

        const current_texture = images.walls[tile_content]
        texture_offset = Math.floor(texture_offset * current_texture.img.width)

        ctx.drawImage(
            current_texture.img,
            texture_offset, 0,
            1, current_texture.img.height,
            x_wall, top_wall,
            1, bottom_wall - top_wall
        )

        if (!sparkling.is_active){
            const fog = getFog(corrected_distance)
            ctx.fillStyle = `rgba(0, 0, 0, ${fog})`
            ctx.fillRect(
                x_wall, top_wall - 1,
                1, bottom_wall - top_wall + 2
            )
        }

        if (current_item === 'lighter'){
            lighter.intensity = Math.min(1 / (corrected_distance), 1)
            lighter.intensity = Math.exp(-corrected_distance * 0.3)
            const light_alpha = Math.min(lighter.intensity, .6) + lighter.flickering.value
            ctx.fillStyle = `rgba(
                255,
                ${150 - (lighter.intensity)},
                5,
                ${light_alpha}
            )`
            ctx.fillRect(
                x_wall, top_wall,
                1, bottom_wall - top_wall
            )
        }

        // if (side === 0){
        //     ctx.fillStyle = 'rgba(0, 0, 0, .2)'
        //     ctx.fillRect(
        //         x_wall, top_wall,
        //         1, bottom_wall - top_wall
        //     )
        // }

        if (w === half_screen.x){
            camera.center_dist_ray.x = camera.position.x + corrected_distance * ray_dir_x * map.grid_offset
            camera.center_dist_ray.y = camera.position.y + corrected_distance * ray_dir_y * map.grid_offset
        }

        const dx = (camera.position.x + corrected_distance * ray_dir_x * map.grid_offset) - camera.position.x
        const dy = (camera.position.y + corrected_distance * ray_dir_y * map.grid_offset) - camera.position.y

        const euclidean_distance = Math.sqrt(dx ** 2 + dy ** 2)

        z_buffer[x_wall] = euclidean_distance
    }
}
const projectSprites = () => {
    sprites.map(sprite => {
        const dx = sprite.position.x - camera.position.x
        const dy = sprite.position.y - camera.position.y
        const angle_diff = Math.atan2(dy, dx)
        sprite.distance = Math.abs(dx * Math.cos(camera.rotation.x) + dy * Math.sin(camera.rotation.x))
        sprite.dx = dx
        sprite.dy = dy
        sprite.angle_to_camera = angle_diff - camera.rotation.x
        sprite.angle_diff = angle_diff
    })

    sprites.sort((a, b) => b.distance - a.distance)

    for (let sprite of sprites){
        if (sprite.angle_to_camera < -Math.PI) sprite.angle_to_camera += 2 * Math.PI
        if (sprite.angle_to_camera > Math.PI) sprite.angle_to_camera -= 2 * Math.PI

        if (Math.abs(sprite.angle_to_camera) > radians_fov) continue

        const sprite_type = sprite.type

        const current_sprite = images[sprite_type][sprite.data.name].img
        const current_sprite_mask = images[sprite_type][`${sprite.data.name}_mask`].img

        const screen_x = (sprite.angle_to_camera / (radians_fov / 2)) * (half_screen.x) + (half_screen.x)
        const sprite_size = sprite.data.size / sprite.distance

        const height_offset = sprite.data.z_axis * (sprite_size / 100)
        
        let alpha = 0
        let x_offset = 1
        let sprite_height = sprite.data.height

        if (current_item === 'lighter'){
            alpha = Math.max(0, sprite.distance / 350) + lighter.flickering.value
        } else {
            alpha = sparkling.is_active ? 0 : Math.max(.7, sprite.distance / 100)
        }

        if (!sprite.data.flat){
            let degrees_angle = (sprite.angle_diff + sprite.angle) * (180 / Math.PI) + 180
            degrees_angle = ((degrees_angle % 360) + 360) % 360
            let index = parseInt(degrees_angle / sprite.data.degrees_variation)
            x_offset = (sprite.data.frames.horizontal - 1 - index) * sprite.data.width
        }

        for (let i = 0 ; i < sprite.data.width ; i++){
            const slice_width = sprite_size / sprite.data.width
            const screen_slice_x = Math.floor(screen_x - (sprite_size / 2) + (i * slice_width))

            if (screen_slice_x < 0 || screen_slice_x > canvas.width) continue
            if (z_buffer[screen_slice_x] < sprite.distance) continue

            const top_y = (half_screen.y - sprite_size / 2) + camera.rotation.y - height_offset
            const scale_x = Math.ceil(sprite_size / sprite.data.width)

            ctx.drawImage(
                current_sprite,
                x_offset + (i * 1), sprite.current_frame * sprite_height,
                1, sprite_height,
                screen_slice_x, top_y,
                scale_x, sprite_size
            )

            ctx.globalAlpha = alpha
            ctx.drawImage(
                current_sprite_mask,
                x_offset + (i * 1), sprite.current_frame * sprite_height,
                1, sprite_height,
                screen_slice_x, top_y,
                scale_x, sprite_size
            )
            ctx.globalAlpha = 1
        }
    }
}
const getFog = (corrected_distance) => {
    const current_fog = current_item === 'lighter' ? lighter.fog_factor : (lighter.fog_factor / 3)
    let fog = (corrected_distance / current_fog)
    if (current_item !== 'lighter'){
        if (fog < 0.8) fog = 0.8
    } else {
        if (fog < 0) fog = 0
    }
    if (fog > 1) fog = 1
    return fog
}
const updateSparkling = () => {
    if (!sparkling.next){
        sparkling.next = Math.floor(Math.random() * (10 - 3) + 3) * 1000
        setTimeout(() => {
            sparkling.is_active = true
            setTimeout(()=> {
                sparkling.is_active = false
                sparkling.next = null
            }, 100)
        }, sparkling.next)
        sparkling.times = 0
    }
}
const updateLightFlickering = () => {
    lighter.flickering.value += lighter.flickering.speed * clock.delta_time
    if (Math.abs(lighter.flickering.value) >= Math.abs(lighter.flickering.max)){
        lighter.flickering.speed = -lighter.flickering.speed
    }
    // console.log("lighter.flickering.value", lighter.flickering.value)
}
const updateClock = timeStamp => {
    clock.delta_time = Math.min((timeStamp - clock.last_update) / 1000, 0.016)
    clock.last_update = timeStamp
}
export const draw = (timeStamp) => {
    requestAnimationFrame(draw)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const fps = Math.round(1 / ((timeStamp - clock.last_update) / 1000))
    updateClock(timeStamp)
    inputListener()
    if (!isNaN(clock.delta_time)){
        player_test.updateTestMove(clock)
        drawSky()
        drawFloor()
        projectCamera()
        projectSprites()
        updateSparkling()
        updateLightFlickering()
        draw2dMap()
        drawHud(ctx, current_item, images.hud_sprites)
    }
    // FPS //
    ctx.fillStyle = 'white'
    ctx.font = '30px bold'
    ctx.fillText(`FPS : ${fps}`, 500, 50)
    // TEST OUTPUT //
    ctx.fillText(test_output, 110, 80)
}
export const initAndRun = async () => {
    try {
        canvas.addEventListener('click', () => {
            // canvas.requestFullscreen().then(()=>{
            //     canvas.requestPointerLock()
            // })
            canvas.requestPointerLock()
        })
        await loadResources(ctx, images)
    } catch (err) {
        console.log(`Error while loading resources : ${err}`)
    }
}