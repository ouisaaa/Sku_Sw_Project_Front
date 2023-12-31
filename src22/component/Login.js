import { Link, useNavigate } from 'react-router-dom';
import styles from '../public/css/Login.module.css';
import { useRef, useState, } from 'react';
import {dataDomain} from "./common";

export default function Login(){

    /**로그인 시도 */
    const idRef= useRef(null);
    const passwordRef=useRef(null);


    function access_login(){
       // fetch(`${dataDomain}/login?id=${idRef.current.value}&password=${passwordRef.current.value}`)
       fetch(`${dataDomain}/member/login?id=${idRef.current.value}&password=${passwordRef.current.value}`)
       .then(res =>{return res.json()})
        .then(data =>{
                if(data == null){
                    alert("로그인 실패")
                    window.location.reload();
                }else{
                    //로그인 성공시 간단한 인증들을 보여주기 위해 jwt대신 쿠키에 회원 아이디를 저장하여 로그인이 필요한 정보들을 접근시
                    //쿠키를 이용하여 인증
                    console.log(data);
                    const cookieId = data.mcode;
                
                    document.cookie=`m_code=${cookieId};path=/`;
                    navigate("/");
                }

        })
    }
    const navigate =useNavigate();
    return(
        <>  <div className={styles.background}>
            <div className={styles.box}>
                <h1>login</h1>
                <div>
                    <p>아이디</p>
                    <input type="text" ref={idRef}/> 
                </div>
                <div>
                    <p>비밀번호</p>
                    <input type="password"ref={passwordRef}/> 
                </div>
                <hr></hr>
                <div>
                    <span>
                        <input type="button" value="GGG"/>
                        <input type="button" value="KKK"/>
                    </span>
                </div>
                <br></br>
                <div>
                    <div>
                        <button onClick={access_login}>로그인</button>
                    </div>
                    <div>
                    <Link to="/signup"><input type="button" value="sign up"/></Link>
                    </div>
                </div>
            </div>
            </div>
        </>
    );
}