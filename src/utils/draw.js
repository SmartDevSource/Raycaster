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