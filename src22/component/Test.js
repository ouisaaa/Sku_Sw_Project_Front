import { Link } from "react-router-dom";

export default function Test(){
    const testCode="후드티"
    return(
        <>
            <h1>test</h1>
            <Link to="/login"><p>login</p></Link>
            <Link to="/signup"><p>signup</p></Link>
            <Link to={"/main/"+ testCode}><p>main</p></Link>
            <Link to="/seller"><p>seller</p></Link>
            <Link to="/Order"><p>Order</p></Link>
        </>
    );
}