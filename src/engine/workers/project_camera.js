self.onmessage = function(event) {
    const {
        map,
        z_buffer,
        ids_registry,
        camera_rotation,
        camera_position,
        canvas_width,
        canvas_height,
        width_fov,
        radians_fov
    } = event.data

    const params_length = 5
    const center_dist_ray = {x: 0, y: 0}
    const results = new Float32Array(canvas_width * params_length)

    for (let w = 0; w <= canvas_width; w++) {
        const ray_angle = camera_rotation.x + radians_fov / 2 - w * width_fov
        const ray_dir_x = Math.cos(ray_angle)
        const ray_dir_y = Math.sin(ray_angle)

        let map_x = Math.floor(camera_position.x / map.grid_offset)
        let map_y = Math.floor(camera_position.y / map.grid_offset)

        const delta_dist_x = Math.abs(1 / ray_dir_x)
        const delta_dist_y = Math.abs(1 / ray_dir_y)

        let step_x, step_y
        let side_dist_x, side_dist_y

        if (ray_dir_x < 0){
            step_x = -1
            side_dist_x = (camera_position.x / map.grid_offset - map_x) * delta_dist_x
        } else {
            step_x = 1
            side_dist_x = (map_x + 1 - camera_position.x / map.grid_offset) * delta_dist_x
        }
        if (ray_dir_y < 0){
            step_y = -1
            side_dist_y = (camera_position.y / map.grid_offset - map_y) * delta_dist_y
        } else {
            step_y = 1
            side_dist_y = (map_y + 1 - camera_position.y / map.grid_offset) * delta_dist_y
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
            ((map_x - camera_position.x / map.grid_offset) + (1 - step_x) / 2) / ray_dir_x :
            ((map_y - camera_position.y / map.grid_offset) + (1 - step_y) / 2) / ray_dir_y

        const corrected_distance = perp_wall_dist * Math.cos(ray_angle - camera_rotation.x)

        const x_wall = (canvas_width - w)
        const height_projection = (canvas_height / corrected_distance) * 1
        const top_wall = ((canvas_width.y / 2) - height_projection) + camera_rotation.y
        const bottom_wall = ((canvas_width.y / 2) + height_projection) + camera_rotation.y

        let texture_offset = (side === 0) ?
            (camera_position.y / map.grid_offset + perp_wall_dist * ray_dir_y) % 1 :
            (camera_position.x / map.grid_offset + perp_wall_dist * ray_dir_x) % 1

        texture_offset = Math.floor(texture_offset * 512)

        if (w === canvas_width / 2){
            center_dist_ray.x = camera_position.x + corrected_distance * ray_dir_x * map.grid_offset
            center_dist_ray.y = camera_position.y + corrected_distance * ray_dir_y * map.grid_offset
        }

        const dx = (camera_position.x + corrected_distance * ray_dir_x * map.grid_offset) - camera_position.x
        const dy = (camera_position.y + corrected_distance * ray_dir_y * map.grid_offset) - camera_position.y

        const euclidean_distance = Math.sqrt(dx ** 2 + dy ** 2)

        results[i * params_length] = corrected_distance
        results[i * params_length + 1] = x_wall
        results[i * params_length + 2] = top_wall
        results[i * params_length + 3] = bottom_wall
        results[i * params_length + 4] = texture_offset

        z_buffer[x_wall] = euclidean_distance
    }
    self.postMessage(results, [z_buffer], center_dist_ray)
}