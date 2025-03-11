export class Sprite{
    constructor({id, type, name, sprite_id, position, draw_data}){
        this.id = id
        this.type = type
        this.name = name
        this.sprite_id = sprite_id
        this.position = position
        this.draw_data = draw_data
        this.angle = 0
        this.distance = 0
        this.dx = 0
        this.dy = 0
    }
}