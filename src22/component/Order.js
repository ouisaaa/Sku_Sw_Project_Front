import { Link, useLocation,useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {dataDomain} from "./common";

import { BiMenu,BiUser,BiCart } from "react-icons/bi";
import styles from "../public/css/Order.module.css";
import logo from "../public/background/logo.png";

import DaumPostcode from "react-daum-postcode";
import { postcodeScriptUrl } from "react-daum-postcode/lib/loadPostcode";
import { isLabelWithInternallyDisabledControl } from "@testing-library/user-event/dist/utils";


import Popup from "reactjs-popup";


export default function Order(){
    const[isListCategory,setIsListCategory]=useState(true); //카테고리창 보여주는 상태 관리
    const[isBasket,setIsBasket] = useState(true);

    const[basket, setBasket]= useState([]);
    const[paymentMethod, setPaymentMethod]=useState("무통장입금");

    const [openPostcode, setOpenPostcode] = useState(false);
    const [address, setAddress] = useState({
        "address1" : "",
        "address2" : "",
    });
    
    const [totalBuyPrice,setTotalBuyPrice]=useState(0);

    function getCookie(name) {                                  // document.cookie 에서 쿠키 값을 가져오는 함수
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);                // 함수의 매개변수로 쿠키이름(name)을 전달하면 해당 쿠키의 값을 반환
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
    }
    const [orderForBasket,setOrderForBasket] = useState([]);

    useEffect(()=>{
        if(getCookie('m_code') != null) {                                               // 현재 페이지에 쿠키에 m_code 값이 있는 경우에만 아래의 fetch를 실행
            fetch(`${dataDomain}/basket/member/mCode?mCode=${getCookie('m_code')}`)     // 쿠키에서 m_code 값을 가져와서 해당 회원의 장바구니 정보 가져옴
            .then(res =>{return res.json()})                                            // 응답 데이터는 json()(괄호 붙어야함) 형식으로 반환되어 data에 저장
            .then(data =>{
                console.log(data);
                setBasket(data);

                
                let sum=0;
                data.map((data)=>sum=sum+(data.option.productInfo.psalePrice*data.bcount));
                setTotalBuyPrice(sum);                                          // basket 상태 업데이트되며 컴포넌트가 리 랜더링 됨
            
                let buyBasket = [];
                data.map((orderModify)=>buyBasket.push({
                    "p_code": parseInt(orderModify.option.productInfo.pcode,10),
                    "op_option_name":orderModify.option.opOptionName,
                    "od_count": parseInt(orderModify.bcount,10),
                    "op_code":parseInt(orderModify.option.opCode,10)
                }));
                
                
                setOrderForBasket(buyBasket);

            })
        }
        // fetch(`${dataDomain}/basket`)
        //     .then(res =>{return res.json()}) /*json() 괄호 붙어야함*/
        //     .then(data =>{
        //         let price=0;
        //         for(let i=0;i<data.length;i++){
        //             price += data[i].p_count*data[i].p_price;
        //         }
        //         setBasket(data);
        //         setTotalBuyPrice(price); 
        //     });
    },[]);
    
    function toggleWindow(){
        setIsListCategory(!isListCategory);
    }
    function toggleWindowB(){
        setIsBasket(!isBasket);
    }
    function tooglePaymentMethod(event){
        event.preventDefault();
        const clickedElement = event.target;
        const textContent = clickedElement.textContent;
        setPaymentMethod(textContent);
    }

    
    /**다음 주소 검색 매시업 */
    function IsDaumPost(){
        setOpenPostcode(!openPostcode);
    }
    function SADaumPost(data){
        console.log(`
            총: ${data},
            주소: ${data.address},
            우편번호: ${data.zonecode}
        `)
        document.getElementById("address1").value=data.address;
        document.getElementById("address2").value=data.zonecode;

        setOpenPostcode(false);
        setSearchAddress(data);
    }
    
    /** 상세 상세 페이지에서 받은 state 값을 토대로 주문 상품 구성 */
    const location = useLocation();
    if(location.state !== null){console.log(location.state);}

    /** 장바구니에서 구매 클릭시  */
    const navigate = useNavigate();             // 훅을 사용하여 페이지 이동을 위한 함수 생성

    function basketBuy() {                      // 장바구니에서 구매 버튼이 클릭되었을 때의 동작 정의
        navigate(
            `/Order/${basket.m_code}`,          // navigate 함수를 사용해서 page 이동
        )
    }
     /**주문 창에서 사고싶지 않는 물품은 삭제를 눌러 삭제를 할수있게*/
     function deleteProduct(event){

        const orderModify= orderForBasket.filter((order)=>order.bcode+'' !=event.target.value);
        // let buyBasket = [];
        // orderModify.map((orderModify)=>buyBasket.push({
        //     "p_code": parseInt(orderModify.product.option.productInfo.pcode,10),
        //     "op_option_name":orderModify.product.option.opOptionName,
        //     "od_count": parseInt(orderForBasket.product.bcount,10),
        //     "op_code":parseInt(orderForBasket.product.option.opCode,10)
        // }));

        // 0
        // : 
        // {p_code: 1, op_option_name: 'S', od_count: 1, op_code: 1}
        // console.log(buyBasket)
        setOrderForBasket(orderModify);

    }
    const receiverNameRef = useRef(null);
    const receiverNumber1Ref = useRef(null);
    const receiverNumber2Ref = useRef(null);
    const receiverNumber3Ref = useRef(null);
    const orderRequest = useRef(null);
    const [searchAddress,setSearchAddress]= useState({});

    function postOrder(){
        const orderInfo = location.state === null ? {
            "product":orderForBasket,
            "o_total_price":totalBuyPrice,
            "o_zip_code":searchAddress.zonecode,
            "o_address":searchAddress.address,
            "o_phone_num":`${receiverNumber1Ref.current.value}-${receiverNumber2Ref.current.value}-${receiverNumber3Ref.current.value}`,
            "o_request":orderRequest.current.value,
            "member":{
                "m_code":parseInt(getCookie('m_code',10))
            }
        }: {
            "product":[{
                "p_code":parseInt(location.state.productBuy.p_code,10),
                "op_option_name":location.state.productBuy.p_option,
                "od_count": parseInt(location.state.productBuy.p_count,10),
                "op_code":parseInt(location.state.productBuy.op_code,10)
            }],
            "o_total_price":parseInt(location.state.productBuy.p_salePrice * location.state.productBuy.p_count,10),
            "o_zip_code":searchAddress.zonecode,
            "o_address":searchAddress.address,
            "o_phone_num":`${receiverNumber1Ref.current.value}-${receiverNumber2Ref.current.value}-${receiverNumber3Ref.current.value}`,
            "o_request":orderRequest.current.value,
            "member":{
                "m_code":parseInt(getCookie('m_code',10))
            }
        }


        console.log(orderInfo);

        fetch(`${dataDomain}/order/newOrder`,{
            method:"POST",
            headers: {
                'Content-Type':"application/json",
            },
            body : JSON.stringify(orderInfo)
        }).then(res =>{if (res.ok ){
                alert(   "상품 주문 완료"); 
                navigate("/");                   // 페이지 새로고침
            }});
    }
    return(
        <>
            <div className={styles.topSection}>
                <span>
                    <button className={styles.topBtn} onClick={toggleWindow}><BiMenu /></button>
                </span>
                <span>
                    <img className={styles.mainLogo}src={logo}/>
                </span>
                <span>
                    <input className={styles.searchBar} type="text"/>
                </span>
                <span>
                    <Link to="/login"><button className={styles.topBtn}><BiUser /></button></Link>
                </span>
                <span>
                    {/* *장바구니 팝업
                    <Popup trigger={<button className={styles.topBtn}><BiCart /></button>}
                        position={"bottom right"}
                        nested
                    >
                        <div className={styles.boxSide}>
                        <table className={`${styles.basket}`}>
                            <thead>
                                <th colSpan={9}>
                                    장바구니
                                </th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>선택</td>
                                    <td colSpan={3}>상품이름</td>
                                    <td colSpan={2}>옵션</td>
                                    <td>수량</td>
                                    <td colSpan={2}>옵션가격</td>
                                    <td colSpan={2}>가격</td>
                                </tr>
                                {
                                  basket.map((basket,index)=>(
                                    <tr key={index}>
                                        <td><button id={index} className={`${styles.deleteBtn}`}>삭제</button></td>
                                        <td colSpan={3}>{basket.p_name}</td>
                                        <td colSpan={2}>{basket.p_option}</td>
                                        <td>{basket.p_count}</td>
                                        <td colSpan={2}>{basket.p_price}</td>
                                        <td colSpan={2}>{basket.p_price * basket.p_count}</td>
                                    </tr>
                                ))
                                }
                            </tbody>
                        </table>
                        <hr></hr>
                        <span><button>구매</button></span>
                    </div>
                    </Popup> */}
                     {/**장바구니 팝업 */}
                     <Popup trigger={<button className={styles.topBtn}><BiCart /></button>}
                        position={"bottom right"}
                        nested
                    >
                        <div className={styles.boxSide}>
                        <table className={`${styles.basket}`}>
                            <thead>
                                <th colSpan={9}>
                                    장바구니
                                </th>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>삭제</td>
                                    <td colSpan={3}>상품이름</td>
                                    <td colSpan={2}>옵션</td>
                                    <td>수량</td>
                                    <td colSpan={2}>판매가</td>
                                    <td colSpan={2}>총구매가</td>
                                </tr>
                                {
                                  basket.map((basket,index)=>(
                                    <tr key={index}>
                                        <td><button id={index} className={`${styles.deleteBtn}`}>삭제</button></td>
                                        <td colSpan={3}>{basket.option.productInfo.pname}</td>
                                        <td colSpan={2}>{basket.option.opOptionName}</td>
                                        <td>{basket.bcount}</td>
                                        <td colSpan={2}>{basket.option.productInfo.psalePrice}</td>
                                        <td colSpan={2}>{basket.option.productInfo.psalePrice * basket.bcount}</td>
                                    </tr>
                                ))
                                }
                            </tbody>
                        </table>
                        <hr></hr>
                        <span><p>총 구매가</p><p>{totalBuyPrice}</p><button onClick={basketBuy}>구매</button></span>
                    </div>
                    </Popup>
                </span>
            </div>
            <div className={styles.container}>
                <div className={styles.box}>
            <div>
                <table className={styles.basket}>
                    <thead>
                        <tr>
                            <th colSpan={2}>
                                배송지
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>수령인</td>
                            <td><input type="text" ref={receiverNameRef}/></td>
                        </tr>
                        <tr>
                            <td>연락처</td>
                            <td>
                                <select ref={receiverNumber1Ref}>
                                    <option>010</option>
                                    <option>02</option>
                                    <option>031</option>
                                    <option>032</option>
                                    <option>033</option>
                                    <option>041</option>
                                    <option>042</option>
                                    <option>043</option>
                                    <option>044</option>
                                    <option>051</option>
                                    <option>052</option>
                                    <option>053</option>
                                    <option>054</option>
                                    <option>055</option>
                                    <option>061</option>
                                    <option>062</option>
                                    <option>063</option>
                                    <option>064</option>
                                    <option>067</option>
                                </select>
                                -
                                <input type="text" size="4" ref={receiverNumber2Ref}/>
                                -
                                <input type="text"size="4" ref={receiverNumber3Ref}/>
                            </td>
                        </tr>
                        <tr>
                            <td>주소</td>
                            <td>
                                <input type="text" id="address1"size={20}/>
                                <button onClick={IsDaumPost}>주소검색</button>
                                <input type="text" id="address2" size={10}/>
                                <input type="text" size={20}/>
                            </td>
                        </tr>
                        {
                            openPostcode && 
                            <DaumPostcode 
                                onComplete={SADaumPost}  // 값을 선택할 경우 실행되는 이벤트
                                autoClose={false} // 값을 선택할 경우 사용되는 DOM을 제거하여 자동 닫힘 설정
                                defaultQuery='판교역로 235' // 팝업을 열때 기본적으로 입력되는 검색어 
                                />
                        }
                        <tr>
                            <td>배송 요청사항</td>
                            <td>
                                <input type="text"size={20} ref={orderRequest}/>
                            </td>
                        </tr>
                    </tbody>
                </table>
                {/*** 다음 매쉬업 */}
                {/** 주문 상품 테이블 */}
               
                <hr></hr>
                <table className={styles.basket}>
                    <thead>
                        <tr>
                            <th colSpan={10}>
                                주문 상품
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                            <tr>
                                <td></td>
                                <td colSpan={3}>상품이름</td>
                                <td colSpan={2}>옵션</td>
                                <td>수량</td>
                                <td colSpan={2}>개별 가격</td>
                                <td colSpan={2}>총가격</td>
                            </tr>
                        {
                            
                             location.state !== null ? 
                                <tr>
                                    <td colSpan={1}><button id={0} className={`${styles.deleteBtn}`}>삭제</button></td>
                                    <td colSpan={3}>{location.state.productBuy.p_name}</td>
                                    <td colSpan={2}>{location.state.productBuy.p_option}</td>
                                    <td>{location.state.productBuy.p_count}</td>
                                    <td colSpan={2}>{location.state.productBuy.p_salePrice}</td>
                                    <td colSpan={2}>{location.state.productBuy.p_salePrice*location.state.productBuy.p_count }</td>
                                </tr>
                             : basket.map((basket, index)=>(
                                <tr>
                                    <td><button id={index} className={`${styles.deleteBtn}`} value={basket.bcode}onClick={deleteProduct}>삭제</button></td>
                                    <td colSpan={3}>{basket.option.productInfo.pname}</td>
                                    <td colSpan={2}>{basket.option.opOptionName}</td>
                                    <td>{basket.bcount}</td>
                                    <td colSpan={2}>{basket.option.productInfo.psalePrice}</td>
                                    <td colSpan={2}>{basket.option.productInfo.psalePrice * basket.bcount}</td>
                                </tr>
                             ))
                             
                        }
                    </tbody>
                </table>
                
                <hr></hr>
                {/** 결제 부분(미구현) */}
                <div>
                    <h4>결제</h4>
                    <span>
                        <button onClick={tooglePaymentMethod}>무통장입금</button>
                        <button onClick={tooglePaymentMethod}>카드 결제(미구현)</button>
                        <button onClick={tooglePaymentMethod}>카카오페이(미구현)</button>
                        <button onClick={tooglePaymentMethod}>토스페이(미구현)</button>
                    </span>
                    {paymentMethod=="무통장입금"? (
                        <div>
                            <p>은행: 신한</p>
                            <p>계좌번호:돈줘줘ㅜ저ㅜ저ㅜ저ㅝ줘저</p>
                            <p>예금주: 돈좀줘</p>
                        </div>
                    ):null}
                    {paymentMethod=="카드 결제(미구현)"? (
                        <div>
                                <p>카드 결제(미구현)</p>
                        </div>
                    ):null}
                    {paymentMethod=="토스페이(미구현)"? (
                        <div>
                                <p>토스페이(미구현)</p>
                        </div>
                    ):null}
                    {paymentMethod=="카카오페이(미구현)"? (
                        <div>
                                <p>카카오페이(미구현)</p>
                        </div>
                    ):null}
                </div>
                <hr></hr>
                <span>
                    {   
                        location.state !== null ?
                        <p>결제 금액: {location.state.productBuy.p_salePrice * location.state.productBuy.p_count}</p>
                        : <p>결제 금액: {totalBuyPrice}</p>
                    } 
                    <button className={styles.paymentBtn} onClick={postOrder}>결제</button>
                </span>
            </div>
               
                </div>
                <div className={styles.boxRight}>
                    <p>총 결제 금액</p>
                    <hr></hr>
                    {   
                        location.state !== null ?
                        <p>{location.state.productBuy.p_salePrice*location.state.productBuy.p_count}</p>
                        : <p>{totalBuyPrice}</p>
                    }   
                </div>
            </div>
            
            <div className={styles.footSection}>
            <hr></hr>
                <h1>Foot Section</h1>
                <Link to='/'><p>test</p></Link>
            </div>
        </>
    );
}