import {GoogleOutlined, FacebookFilled} from '@ant-design/icons';
import { Link } from 'react-router-dom';

const Login = () => {
  return (
    <div className= "w-full h-screen flex justify-center items-center bg-white">
    
      <div className='bg-[#D3D3D3] w-1/4  px-4 rounded-2xl'>
        <div className='text-[#161617] text-center text-4xl my-3 font-sans'>Login </div>
        <label className='text-[#161617]'>Email</label>
        <input
        placeholder='Enter Your email'
        type='email' 
        className='w-full py-2 px-4 rounded-md mb-4 mt-1'/>
         <label className='text-[#161617] '>Password</label>
        <input
        type='password'
        placeholder='Enter Your Password'
        className='w-full py-2 px-4 rounded-md mb-4 mt-1'/>
        <div className='flex justify-center mt-1'>
            <button className='py-2 w-full mx-auto bg-[#001529] text-white rounded-md'>Login</button>
        </div>  
        <div className='text-[#161617] text-center my-3 text-[14px]'>Or Login With </div>
        <div className="text-2xl text-[#848884] flex justify-center gap-2">
      <GoogleOutlined /> 
      <FacebookFilled className="rounded-full" />
    </div>
    <div className='text-center mt-2 mb-4'>Do not have account?<Link to="/signup"><span className='text-[#4c9ae3] font-medium'>Signup</span></Link></div>
    </div>
  </div>
  
  )
}

export default Login