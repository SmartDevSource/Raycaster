export class Sprite{
    constructor({id, type, name, sprite_id, position, angle=0, draw_data}){
        this.id = id
        this.type = type
        this.name = name
        this.sprite_id = sprite_id
        this.position = position
        this.angle = angle
        this.angle_diff = 0
        this.angle_to_camera = 0
        this.distance = 0
        this.dx = 0
        this.dy = 0
        this.draw_data = draw_data
        this.current_frame = 0
    }
}