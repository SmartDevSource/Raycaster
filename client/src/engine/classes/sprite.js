export class Sprite{
    constructor({id, type, sprite_id, position, angle=0, data}){
        this.id = id
        this.type = type
        this.sprite_id = sprite_id
        this.position = position
        this.angle = angle
        this.angle_diff = 0
        this.angle_to_camera = 0
        this.distance = 0
        this.dx = 0
        this.dy = 0
        this.data = data
        this.current_frame = 0
    }
}