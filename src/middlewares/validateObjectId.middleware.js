import mongoose from "mongoose"
import ApiError from "../utils/ApiError.js"

const validateObjectId = (paramName) => {
    return (req, res, next) => {
        const id = req.params[paramName]
        if (!id) throw new ApiError(400, `${paramName} is required`)
        if (!mongoose.Types.ObjectId.isValid(id)) throw new ApiError(400, `Invalid ${paramName}`)
        next()
    }
}

export { validateObjectId }