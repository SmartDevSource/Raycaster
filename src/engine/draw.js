import { clock } from "../vars.js"
import { camera } from "./camera.js"
import { hud_items } from "../resources/hud_items.js"

const switch_state = {
    switched: false,
    angle: -1,
    speed: 3
}

const current_item = {
    name: '',
    image: new Image(),
    frame_width: 0,
    data: {}
}

const weapon_bobbing = {
    angle: 0,
    speed: 5,
    length: 20
}

export const drawCircle = (ctx, position, radius, color) => {
    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.arc(
        position.x,
        position.y,
        radius,
        0,
        Math.PI * 2
    )
    ctx.stroke()
    ctx.closePath()
}

export const draw2dLine = (ctx, start, end, line_width, color) => {
    ctx.beginPath()
    ctx.lineWidth = line_width
    ctx.strokeStyle = color
    ctx.moveTo(
        start.x,
        start.y,
    )
    ctx.lineTo(
        end.x,
        end.y
    )
    ctx.stroke()
    ctx.closePath()
}

export const drawHud = (ctx, current_item_name, hud_sprites) => {
    if (current_item.name !== current_item_name){
        switch_state.switched = false,
        switch_state.angle = -1,

        current_item.image = hud_sprites[current_item_name].img
        current_item.data = hud_items[current_item_name]
        current_item.frame_width = (current_item.image.width / current_item.data.frame_count)

        current_item.name = current_item_name
    }
    if (!switch_state.switched && current_item.image){
        switchItemAnimation(ctx)
    } else {
        drawWeapon(ctx)
    }
}

const switchItemAnimation = ctx => {
    ctx.save()

    const center_x = current_item.data.position.x + (current_item.data.scale.x)
    const center_y = current_item.data.position.y + (current_item.data.scale.y)

    ctx.translate(center_x, center_y)
    ctx.rotate(switch_state.angle)
    ctx.drawImage(
        current_item.image,
        current_item.frame_width * current_item.data.current_frame,
        0,
        current_item.frame_width,
        current_item.image.height,
        -current_item.data.scale.x,
        -current_item.data.scale.y,
        current_item.data.scale.x,
        current_item.data.scale.y
    )

    if (switch_state.angle < 0){
        switch_state.angle += (switch_state.speed * clock.delta_time)
    } else {
        switch_state.angle = -1
        switch_state.switched = true
    }

    ctx.restore()
}

const drawWeapon = ctx => {
    current_item.data.current_tick += current_item.data.speed_anim * clock.delta_time

    if (current_item.data.current_tick >= 1){
        if (current_item.data.current_frame < current_item.data.frame_count - 1){
            current_item.data.current_frame++
        } else {
            current_item.data.current_frame = 1
        }
        current_item.data.current_tick = 0
    }

    if (camera.is_moving){
        weapon_bobbing.angle += weapon_bobbing.speed * clock.delta_time
        if (weapon_bobbing.angle > Math.PI || weapon_bobbing.angle < 0){
            weapon_bobbing.speed = -weapon_bobbing.speed
        }
    } else {
        weapon_bobbing.angle *= Math.exp(- 5 * clock.delta_time)
        if (Math.abs(weapon_bobbing.angle) < 0.01){
            weapon_bobbing.angle = 0
        }
    }

    ctx.drawImage(
        current_item.image,
        current_item.frame_width * current_item.data.current_frame,
        0,
        current_item.frame_width,
        current_item.image.height,
        current_item.data.position.x + weapon_bobbing.length * Math.cos(weapon_bobbing.angle),
        current_item.data.position.y + weapon_bobbing.length * Math.sin(weapon_bobbing.angle),
        current_item.data.scale.x,
        current_item.data.scale.y
    )
}