import { map, getMapSprites } from '../map.js'
import { sprites_data } from '../resources/sprites_data.js'
import { draw2dLine, drawCircle, drawHud } from './draw.js'
import { images } from '../resources/images.js'
import { clock, sparkling, lighter } from '../structs.js'
import { camera } from './camera.js'
import { inputListener } from '../input_handler.js'
import { loadResources } from '../resources/resources_handler.js'
import { ids_registry } from './id_registry.js'

// const project_camera_worker = new Worker("/workers/project_camera.js")

const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')

const degrees_fov = 60
const radians_fov = degrees_fov * (Math.PI / 180)
const screen_resolution = {w: 640, h: 480}
const width_fov = radians_fov / screen_resolution.w
canvas.width = screen_resolution.w
canvas.height = screen_resolution.h
const half_screen = {x: canvas.width / 2, y: canvas.height / 2}
const multi_directional_frames = 24

const floor_height = 750
const z_buffer = new Array(canvas.width)

const current_item = 'lighter'

const map_sprites = getMapSprites()
console.log("map_sprites", map_sprites)

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
    // project_camera_worker.postMessage({
    //     map,
    //     z_buffer,
    //     ids_registry,
    //     camera_rotation: camera.rotation,
    //     camera_position: camera.position,
    //     canvas_width: canvas.width,
    //     canvas_height: canvas.height,
    //     width_fov,
    //     radians_fov
    // })

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
                tile_content = ids_registry.walls[wall_data]
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
    map_sprites.map(sprite => {
        const dx = sprite.position.x - camera.position.x
        const dy = sprite.position.y - camera.position.y
        const angle_diff = Math.atan2(dy, dx)
        sprite.distance = Math.abs(dx * Math.cos(camera.rotation.x) + dy * Math.sin(camera.rotation.x))
        sprite.dx = dx
        sprite.dy = dy
        sprite.angle = angle_diff - camera.rotation.x
        sprite.angle_diff = angle_diff
    })
    map_sprites.sort((a, b) => b.distance - a.distance)

    for (let sprite of map_sprites){
        if (sprite.angle < -Math.PI) sprite.angle += 2 * Math.PI
        if (sprite.angle > Math.PI) sprite.angle -= 2 * Math.PI

        if (Math.abs(sprite.angle) > radians_fov) continue

        const sprite_name = ids_registry.sprites[sprite.id]
        const current_sprite = images.map_sprites[sprite_name].img
        const current_sprite_mask = images.map_sprites[`${sprite_name}_mask`].img
        const sprite_data = sprites_data[sprite_name]

        const screen_x = (sprite.angle / (radians_fov / 2)) * (half_screen.x) + (half_screen.x)
        const sprite_size = sprite_data.size / sprite.distance

        const height_offset = sprite_data.height * (sprite_size / 100)
        
        let alpha, y_offset, sprite_height;

        if (current_item === 'lighter'){
            alpha = Math.max(0, sprite.distance / 350) + lighter.flickering.value
        } else {
            alpha = sparkling.is_active ? 0 : Math.max(.7, sprite.distance / 100)
        }

        if (sprite_data.flat){
            y_offset = 0
            sprite_height = current_sprite.height
        } else {
            let degrees_angle = (sprite.angle_diff * (180 / Math.PI) + 180) + 10
            if (degrees_angle < 0){
                degrees_angle = 360
            } else if (degrees_angle > 359){
                degrees_angle = 0
            }
            y_offset = parseInt(degrees_angle / 15) // 30 degrés par section pour chaque côté (car 12 * 30 === 360)
            test_output = y_offset
            sprite_height = (current_sprite.height / multi_directional_frames)
        }
        
        for (let i = 0 ; i < current_sprite.width ; i++){
            const slice_width = sprite_size / current_sprite.width
            const screen_slice_x = Math.floor(screen_x - (sprite_size / 2) + (i * slice_width))

            if (screen_slice_x < 0 || screen_slice_x > canvas.width) continue
            if (z_buffer[screen_slice_x] < sprite.distance) continue

            const top_y = (half_screen.y - sprite_size / 2) + camera.rotation.y - height_offset
            const scale_x = Math.ceil(sprite_size / current_sprite.width)
            
            ctx.drawImage(
                current_sprite,
                i * 1, y_offset * sprite_height,
                1, sprite_height,
                screen_slice_x, top_y,
                scale_x, sprite_size
            )

            ctx.globalAlpha = alpha
            ctx.drawImage(
                current_sprite_mask,
                i * 1, y_offset * sprite_height,
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
const drawScene = () => {
    drawSky()
    drawFloor()
    projectCamera()
    projectSprites()
    updateSparkling()
    updateLightFlickering()
    draw2dMap()
    drawHud(ctx, current_item, images.hud_sprites)
}
const updateClock = timeStamp => {
    clock.delta_time = Math.min((timeStamp - clock.last_update) / 1000, 0.016)
    clock.last_update = timeStamp
}
const draw = (timeStamp) => {
    requestAnimationFrame(draw)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const fps = Math.round(1 / ((timeStamp - clock.last_update) / 1000))
    updateClock(timeStamp)
    inputListener()
    if (!isNaN(clock.delta_time)){
        drawScene()
    }
    // FPS //
    ctx.fillStyle = 'white'
    ctx.font = '30px bold'
    ctx.fillText(`FPS : ${fps}`, 500, 50)
    // TEST OUTPUT //
    ctx.fillText(test_output, 110, 80)
}
const initAndRun = async () => {
    try {
        canvas.addEventListener('click', () => {
            // canvas.requestFullscreen().then(()=>{
            //     canvas.requestPointerLock()
            // })
            canvas.requestPointerLock()
        })
        await loadResources(ctx, images)
        draw()
    } catch (err) {
        console.log(`Error while loading resources : ${err}`)
    }
}

initAndRun()