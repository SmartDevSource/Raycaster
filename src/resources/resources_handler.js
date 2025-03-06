export const loadResources = async (ctx, images) => {
    const loadImage = (image_object) => {
        return new Promise((resolve, reject) => {
            image_object.img.src = `${image_object.path}`
            image_object.img.onload = () => {
                const textureData = ctx.createImageData(image_object.img.width, image_object.img.height)
                const textureCtx = document.createElement('canvas').getContext('2d')
                textureCtx.canvas.width = image_object.img.width
                textureCtx.canvas.height = image_object.img.height
                textureCtx.drawImage(image_object.img, 0, 0, image_object.img.width, image_object.img.height)
                textureData.data.set(textureCtx.getImageData(0, 0, image_object.img.width, image_object.img.height).data)
                image_object.pixels_data = textureData.data
                resolve(image_object)
            }
            image_object.img.onerror = () => reject(`Failed to load image ${image_object.path}`)
        })
    }

    const imagePromises = Object.values(images).map(loadImage)

    return Promise.all([...imagePromises])
    .then(() => {
        console.log('All resources loaded')
    })
    .catch(err => {
        console.error('Error while loading resources :', err)
        throw err
    })
}