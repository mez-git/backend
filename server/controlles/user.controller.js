import User from "../model/user.model.js"
import Post from "../model/post.model.js"
import getDataUri from "../utils/datauri.js"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import cloudinary from "../utils/cloudinary.js"
export const register=async(req,res)=>{
    try {
        const {username,email,password}=req.body
        if(!username||!email||!password){
            return res.status(401).json({
                message:"something is missing",
                success:false
            });

        }
        const user=await User.findOne({email})
        if(user){
            return res.status(401).json({
                message:"user already exist",
                success:false

            })

        }
        const hashedPassword=await bcrypt.hash(password,10)
        await User.create({
            username,
            email,
            password:hashedPassword
        })
        return res.status(200).json({
            message:"user created",
            success:true

        })
    } catch (error) {
        console.log(error)
    }
}
export const login=async(req,res)=>{
    try {
        const{email,password}=req.body;
        if(!email||!password){
            return res.status(401).json({
                message:"something is missing",
                success:false
            });

    }
    let user=await User.findOne({email})
    if(!user){
        return res.status(401).json({
            message:"incorrect credentials",
            success:false
        });
    }
    const isPasswordMatch=await bcrypt.compare(password,user.password)
    if(!isPasswordMatch){
        return res.status(401).json({
            message:"password didn't match",
            success:false
        });
    }
    const populatePosts=await Promise.all(
        user.posts.map(async(postId)=>{
            const post=await Post.findById(postId);
            if(post.author.equals(user._id)){
                return post
            }
            return null
        })
    )
    user={
        _id:user._id,
        username:user.username,
        profilePicture:user.profilePicture,
        bio:user.bio,
        followers:user.followers,
        followings:user.followings,
        posts:populatePosts
    }
    
    const token=await jwt.sign({userId:user._id},process.env.SECRET_kEY,{expiresIn:"1d"});
    return res.cookie("token",token,{httpONly:true,sameSite:'strict',maxAge:1*24*60*60*1000}).json({
        message:`welcome back ${user.username}`,
        success:true,
        user
    }) 
 }catch (error) {
        console.log(error)
    }
    

}

export const logout =async (_,res)=>{
try {
    return res.cookie("token","",{maxAge:0}).json({
        message:"user loged out successfully",
        success:true
    })
} catch (error) {
    console.log(error)
}
}

export const getProfile=async (req,res)=>{
    try {
        const userId=req.params.id;
        let user=await User.findById(userId).select('-password');
        return res.status(200).json({
            user,
            success:true
        })

    } catch (error) {
        console.log(error)  
    };

}

export const editProfile=async(req,res)=>{
    try {
        const userId=req.id;
        const {bio,gender}=req.body;
        const profilePicture=req.file;
        let  cloudResponse ;

        if(profilePicture){
            const fileUri=getDataUri(profilePicture);
            cloudResponse=  await cloudinary.uploader.upload(fileUri)
        }
        const user=await User.findById(userId);
        if(!user){
            return res.status(404).json({
                message:"user not found",
                success:false
            })
        }
        if(bio)user.bio=bio;
        if(gender)user.gender=gender;
        if(profilePicture)user.profilePicture=cloudResponse.secure_url;

        await user.save()
        return res.status(200).json({
            message:"Profile updated successfully",
            success:true,
            user
        }) 
    } catch (error) {
        console.log(error) 
    }
}
export const getSuggestedUser=async(req,res)=>{
    try {
        const suggestedUser=await User.find({_id:{$ne:req.id}}).select("-password")
        if(!suggestedUser){
            return res.status(400).json({
                message:"currently donot have any users",

            })
           

        }
        return res.status(200).json({
            success:true,
            users:suggestedUser

        })
    } catch (error) {
        console.log(error)
    }
}

export const followOrUnfollow=async(req,res)=>{
    try {
        const follower=req.id;
        const followed=req.params.id;
        if(follower===followed){
            return res.status(400).json({
                message:"you can not follow/unfollow your self",
                status:false
            })

        }
        const user=await User.findById(follower)
        const targetUser=await User.findById(followed)
        if(!user ||!targetUser){
            return res.status(400).json({
                message:"user not found",
                status:false
            })
        }
        //decision to follow or not
       const isFollowing=user.followings.includes(followed)
        if(isFollowing){
            await Promise.all([
                User.updateOne({_id:follower},{$pull:{followings:followed}}),
                User.updateOne({_id:followed},{$pull:{followers:follower}})
            ])
            return res.status(200).json({
                message:"unfollowed",
                success:true
            })

        }else{
            await Promise.all([
                User.updateOne({_id:follower},{$push:{followings:followed}}),
                User.updateOne({_id:followed},{$push:{followers:follower}})
            ])
            return res.status(200).json({
                message:"followed",
                success:true
            })

        }
    } catch (error) {
        console.log(error)
    }
}