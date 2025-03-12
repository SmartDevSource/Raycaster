import { Sprite } from "./sprite.js"
import { ids_registries } from "../../resources/ids_registries.js"

export class Player{
    constructor({id, position, angle}){
        this.id = id
        this.position = position
        this.angle = angle
        this.sprite_id = 3
        this.sprite = this.initSprite()
        /// TEST ///
        this.speed_test = 30
        this.timers = {move: 0, anim: 0}
    }
    initSprite(){
        const sprite_data = ids_registries.sprites[this.sprite_id]

        return new Sprite({
            id: this.id,
            type: 'character_sprites',
            sprite_id: this.sprite_id,
            position: {x: this.position.x, y: this.position.y},
            angle: this.angle,
            data: sprite_data
        })
    }
    updateTestMove(clock){
        this.position.x += this.speed_test * Math.cos(this.angle) * clock.delta_time
        this.position.y += this.speed_test * Math.sin(this.angle) * clock.delta_time
        this.sprite.position.x = this.position.x
        this.sprite.position.y = this.position.y

        this.timers.move += clock.delta_time
        this.timers.anim += clock.delta_time 
        
        if (this.timers.anim > .2){
            if (this.sprite.current_frame < this.sprite.data.frames.vertical -1){
                this.sprite.current_frame ++
            } else {
                this.sprite.current_frame = 0
            }
            this.timers.anim = 0
        }

        if (this.timers.move > 1){
            this.angle = (this.angle + Math.PI) % (2 * Math.PI)
            this.sprite.angle = this.angle
            
            this.timers.move = 0
        }
    }
}