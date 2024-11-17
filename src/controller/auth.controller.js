
import bcrypt from "bcryptjs"
import User from "../model/user.js"
import crypto from "crypto"
import { request } from "http";
export const register = async (request,reply) => {
    try {
        const { name, email, password } = request.body;

        if (!name || !email || !password) {
            return reply.send("all fileds are requried")
        }


        const hashedPassword = await bcrypt.hash(password, 10)
        const user =  new User({ name, email,password: hashedPassword });
        await user.save()
        reply.code(201).send({msg:"user register successfully"})
    } catch (error) {
        reply.send(error)
    }
}

export const login = async (request, reply) => {
    try {
        const { email, password } = request.body;
        const user = await User.findOne({ email });
        if (!user) {
            return reply.code(404).send({msg: "User does not exists!"})
        }

        const isValid = await bcrypt.compare(password, user.password)
        
        if (!isValid) {
            return reply.code(400).send({msg: "Invalid email or password"})
        }

        const token = request.server.jwt.sign({ id: user._id })
        reply.send({token})
    } catch (error) {
        reply.send(error)
    }
}

export const forgotPassword = async (request, reply) => {
    try {
        const { email } = request.body;

        const user = await User.findOne({ email })
        if (!user) {
            return reply.notFound("User not found")
        }

        const resetToken = crypto.randomBytes(32).toString("hex");

        const resetPasswordExpiry = new Date() + 10 * 60 * 1000;

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpiry = resetPasswordExpiry;

        await user.save({ validateBeforeSave: false });

        const resetUrl = `http://localhost:${process.env.PORT}/api/auth/reset-password/${resetToken}`

        reply.send({resetUrl})
    } catch (error) {
        reply.send(error)
    }
}

export const resetPassowrd = async (request, reply) => {
    const resetToken = request.params.token
    const {newPassword} = request.body

    const user = await User.findOne({
        resetPasswordToken: resetToken,
        resetPasswordExpiry: { $gt: Date.now() },
    })

    if(!user){
        return reply.badRequest("Invalid or expired password reset token")
    }

    //hash the password
    const hasedPassword = await bcrypt.hash(newPassword, 12)
    user.password = hasedPassword
    user.resetPasswordToken = undefined
    user.resetPasswordExpiry = undefined

    await user.save();

    reply.send({message: "password reset successful"})
}

export const logout = async (request, reply) => {
    reply.send({message: "User logged out"})
}