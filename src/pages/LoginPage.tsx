import { useState } from "react"

const LoginPage = () => {
    const [emailInput, setEmailInput] = useState('');

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!emailInput.trim()){
            console.log("Enter valid email");
            return;
        }
    }
    return (
        <div>
            <h2>Welcome to syncly</h2>

            <form action="" onSubmit={handleSubmit}>
                <input type="email" value={emailInput} onChange={(e)=> {setEmailInput(e.target.value)}} name="" id="" placeholder="Enter Email"/>
                <button>Login</button>
            </form>
        </div>
    )
}

export default LoginPage