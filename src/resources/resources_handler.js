export const loadResources = async (ctx, images) => {
    const loadImage = (image_object) => {
        return new Promise((resolve, reject) => {
            image_object.img.src = `${image_object.path}`
            image_object.img.onload = () => {
                resolve(image_object)
            }
            image_object.img.onerror = () => reject(`Failed to load image ${image_object.path}`)
        })
    }

    const imagePromises = Object.values({
        ...images.walls,
        ...images.hud_sprites,
        ...images.map_sprites,
        ...images.skyboxes
        }
    ).map(loadImage)

    return Promise.all([...imagePromises])
    .then(() => {
        console.log('All resources loaded')
    })
    .catch(err => {
        console.error('Error while loading resources :', err)
        throw err
    })
}