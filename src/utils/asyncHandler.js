// middleware wrapper -> reusable

// 1st mthod (through try/catch)
// const asyncHandler = (reqHandler) => async(req,res,next) => {       // High order functions: func which accept func as parameter and pass that in another func 
//     try{
//         await reqHandler(req,res,next)
//     }catch(error){
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

// 2nd method (trhrough promises)
const asyncHandler = async(reqHandler)=>{
    (req,res,next)=>{
        Promise.resolve(reqHandler(req,res,next)).catch(error => next(error))
    }
}

export default asyncHandler;