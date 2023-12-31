import { Link, useParams,useNavigate } from "react-router-dom";
import { useRef,useEffect, useState } from "react";
import {dataDomain} from "./common";
import { BiMenu,BiUser,BiCart } from "react-icons/bi";

import styles from "../public/css/ProductDetail.module.css";
import logo from "../public/background/logo.png";
import Popup from "reactjs-popup";

// main에서 상품 클릭하면 넘어오는데 아직 productDetailed/undefined 임 > 화면이 안뜸 > Main.js 에서 해결
export default function ProductDetail(){
    const[isListCategory, setIsListCategory] = useState(true); // 카테고리창 보여주는 상태 관리
    const[isBasket, setIsBasket] = useState(true);              // 장바구니 상태를 관리하는 변수

    const[categoryList, setCategoryList] = useState([]);        // 카테고리 목록을 저장하는 상태 변수
    const[details, setDetails] = useState({});                    // 상품 상세 정보를 저장하는 상태 변수
                                                                // spring controller를 postman 돌려서 받는 값을 집어넣는다 생각해라 {}객체로 받는거 [] 배열로 받는거
                                                                // 얘도 결국엔 상품 정보를 받아와서 해야하는 놈임 ㅇㅈ? localhost:8080/product 로 시작하는 놈들 가져와야 함 근데 얘는 상품 정보를 보여줄거니까
                                                                // p_code 로 찾아서 가져오겠지 맞나?
    
    const[basket, setBasket]= useState([]);                     // 장바구니에 담긴 상품 목록을 저장하는 상태 변수
    const[productOption, setProductOption] = useState([]);      // 상품 옵션을 저장하는 상태 변수

    const {p_code} = useParams();                                // URL에서 p_code 값을 추출
    //console.log('p_code:', pcode);
    //console.log('Before fetch - p_code:', pcode);

    function getCookie(name) {                                  // document.cookie 에서 쿠키 값을 가져오는 함수
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);                // 함수의 매개변수로 쿠키이름(name)을 전달하면 해당 쿠키의 값을 반환
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
    }
    useEffect(()=>{
        // fetch(`${dataDomain}/product/productInfo?p_code=${p_code}`) // 상품의 상세정보 가져오기
        // .then(res =>{return res.json()})                        /*json() 괄호 붙어야함*/
        // .then(data =>{
        //     setDetails(data);                                   // 가져온 상세정보를 상태 변수에 설정
        // });

        /**옵션 가져오기 */
        fetch(`${dataDomain}/option/product?pCode=${p_code}`)                                  // 서버에서 모든 옵션 정보를 가져오는 요청
            .then(res => { return res.json() }) /*json() 괄호 붙어야함*/
            .then(data => {
                // console.log(data);
                const productInfo = data[0].productInfo;
                // const option = data.option;
                let option =[];
                // console.log(productInfo);
                // console.log(option);

                setDetails(productInfo);
                // setProductOption(option);

                // data.map((data) => productInfo.push(data.productInfo)); // 서버에서 받아온 데이터를 가공하여 필요한 형태로 저장
                data.map((data) => option.push({
                    "opCode":       data.opCode,
                    "opOptionName": data.opOptionName,
                    "opQuantity":   data.opQuantity,
                    "pcode":        data.productInfo.pcode
                }))

                //console.log(option);                                    // 가공된 데이터를 출력하여 확인
                                                                        // 중복되지 않은 상품 정보만 추려내기
                // const setData = productInfo.find((product)=>product.pcode===parseInt(p_code,10));
                // console.log(setData);
                // setDetails(setData);                                    // 상품 정보와 옵션 정보를 상태로 업데이트
                setProductOption(option);

                // console.log(data.pcode);
                //  console.log(setData);
                //  console.log(p_code);
                // console.log(productInfo);
            });

            if(getCookie('m_code') != null) {                                               // 현재 페이지에 쿠키에 m_code 값이 있는 경우에만 아래의 fetch를 실행
                fetch(`${dataDomain}/basket/member/mCode?mCode=${getCookie('m_code')}`)     // 쿠키에서 m_code 값을 가져와서 해당 회원의 장바구니 정보 가져옴
                .then(res =>{return res.json()})                                            // 응답 데이터는 json()(괄호 붙어야함) 형식으로 반환되어 data에 저장
                .then(data =>{
                    // console.log(data);
                    setBasket(data);
                    let sum=0;
                    data.map((data)=>sum=sum+(data.option.productInfo.psalePrice*data.bcount));
                    setBasketTotalPrice(sum);                                          // basket 상태 업데이트되며 컴포넌트가 리 랜더링 됨
                })
            }
    
            
            fetch(`${dataDomain}/category/all`)                             // 모든 카테고리 가져오기
            .then(res =>{return res.json()})                        /*json() 괄호 붙어야함*/
            .then(data =>{
                //console.log(data);
                setCategoryList(data);                              // 가져온 카테고리 목록을 상태 변수에 설정
            });



//        fetch(`${dataDomain}/option?p_code=${p_code}`)              // 상품의 옵션 가져오기
//            .then(res =>{return res.json()})                        /*json() 괄호 붙어야함*/
//            .then(data =>{
//                setProductOption(data);                             // 가져온 옵션정보를 상태 변수에 설정
//            });
    },[]);

    //여러 이미지 받아오는 코드
    const [image,setImage] = useState();

    useEffect(()=>{
       // console.log(details.pimageName);
        fetch(`${dataDomain}/product/productImage?image=${details.pimageName}`)
        .then(res => res.blob())
        .then(imageBlob => URL.createObjectURL(imageBlob)) //이미지 이름을 통해 스프링부트 디렉토리에서 이미지를 가져온다
        .then(image => {
            setImage(image);   //받아온 모든 이미지 파일 image상태 변수에 넣고
        }).catch(error => {
                console.error('Error fetching image:', error);
            });
    },[details])

    function toggleWindow(){                                // 카테고리 창을 토글하는 함수
        setIsListCategory(!isListCategory);
    }
    function toggleWindowB(){                               // 장바구니 창을 토글하는 함수
        setIsBasket(!isBasket);
    }
    /**카테고리 클릭시 */
    function click_selectPage(event){
        const clickedElement = event.target;                // 클릭된 요소와 해당 텍스트 콘텐츠 가져오기
        const textContent = clickedElement.textContent;
        
        navigate('/main/'+textContent);                     //해당 카테고리 페이지로 가기
    }

    /**카테고리 랜더링 */
    const [downCategory,setDownCategory] = useState();
    const [isLowCategory,setIsLowCategory]=useState(false); // 카테고리 추가 누를시 표시되는 window의 상태

    

    /**상위 카테고리가 선택이 된다면 그 밑에 하위 카테고리가 나올수있게 설정 */
    function selectHighCategory(event){
        console.log(event.target.textContent);
        // 선택된 상위 카테고리의 정보 찾기
        const finder=categoryList.find((category)=> category.ccategoryName === event.target.textContent);
        // 선택된 상위 카테고리에 속하는 모든 하위 카테고리 찾기
        const lowCategoryes=categoryList.filter((category)=> finder.ccode+'' === category.cupCategory)
       
        // 하위 카테고리 상태 업데이트 및 표시 여부 설정
        setDownCategory(lowCategoryes);
        setIsLowCategory(true);
    }

    /**장바구니 추가 */
    function plusShopingBasket(){
        console.log(selectOption);
        const basketForm = {    
            "bcount":parseInt(productCountRef.current.value,10), // int형 변수는 형변환을 통해서 보내줘야 상대측이 이걸보고 int로 바꿀수가 ㅇ있다
            "mcode": parseInt(getCookie('m_code'),10),
            "opcode": parseInt(selectOption.opCode,10)
        }

        console.log(basketForm);
        fetch(`${dataDomain}/basket/add`,            // 서버에 장바구니 추가 요청
        {
            method:"Post",
            headers: {
                'Content-Type':"application/json",
            },
            body : JSON.stringify(basketForm)
        }
        )
            .then(res =>{if (res.ok ){
                alert(   "등록"); 
                window.location.reload();                       // 페이지 새로고침
            }});
    }


    /**옵션 변경시 총 가격 변동 */
    const [selectOption,setSelectOption] = useState({});                //선택한 옵션의 정보를 담는 변수
    const [totalPrice,setTotalPrice] = useState(0);                    //총 가격의 정보를 담는 변수
    const [basketTotalPrice,setBasketTotalPrice] = useState(0);  

    // 옵션 변경 시 호출되는 함수
    function optionChange(event){
        const selectOptionInfo=productOption.find((option)=>option.opCode+''===event.target.value);
        
        setSelectOption(selectOptionInfo); // 선택한 옵셥의 정보를 업데이트
    }
    // 수량 변경 시 호출되는 함수
    function countChange(){
        setTotalPrice(productCountRef.current.value*details.psalePrice);  // 총 가격을 계산하여 업데이트
    }
    
    // 상품 바로구매 클릭시 해당 상품 선택된 옵션 및 상품 정보 state 넘어가기
    const optionCodeRef = useRef(null);                 // 옵션 이름 
    const productCountRef =useRef(null);                // 상품 수량

    const [productBuy,setProductBuy] = useState({       // 상품 구매 정보를 담는 상태 변수
            "p_code":"",                                //이거 안해주면 그대로 휙 넘어감
            "p_option_name": "",
            "p_option_price":0,
            "p_count" : 0,
            "p_price" : 0,
            "op_code" : 0
        });
    const navigate = useNavigate();                     // React Router의 useNavigate 훅을 사용하여 페이지 이동을 관리하는 함수

    function isProductBuy(){                            // 상품을 바로 구매할 때 호출되는 함수
       setProductBuy({
            "p_code" : details.pcode,                  // 상품 코드
            "p_name" : details.pname,                  // 상품 이름
            "p_option": selectOption.opOptionName,                   // 선택된 옵션
            "p_count" : productCountRef.current.value,  // 상품 수량
            "p_salePrice" : details.psalePrice ,                // 상품 가격
            "op_code":selectOption.opCode
        });
        // navigate('/chectout'); // checkout 페이지로 이동하는 예시 경로
    }

    /** location을 통해서 state 값을 넘겨주고 이걸제대로 되게끔 처리 */
    useEffect(()=>{
        if(productBuy.p_price !==0){            // productBuy 상태 변수가 변경될 때 실행
                navigate(
                    `/Order/${p_code}`,
                     {state : {productBuy}}
                )}
    },[productBuy])

    /** 장바구니에서 구매 클릭시  */
    function basketBuy() {
        navigate(`/Order/${basket.m_code}`);
      }
    /**function basketBuy(){
        navigate(
            `/Order/${basket.m_code}`          // 장바구니에 있는 상품들을 주문(Order) 페이지로 이동
        )
    }*/

    /**장바구니에서 삭제하고픈 물품을 삭제를 한다면 클릭이 되게  */
    function delectProduct(event){
        console.log(basket);
        fetch(`${dataDomain}/basket/productDelete?bcode=${basket[event.target.id].bcode}`, // 클릭된 상품을 장바구니에서 삭제
            {
                method:"Delete",
                headers: {
                    'Content-Type':"application/json",
                },
            }
        ).then(res =>{if (res.ok ){
                alert(   "삭제완료"); 
                window.location.reload();                                       // 페이지 새로고침
            }});
    }
    // /** location을 통해서 state 값을 넘겨주고 이걸제대로 되ㄱ */
    // useEffect(()=>{
    //    // console.log("asd   "+basketBuy[0].p_code+"  "+basketBuy[1].p_code);
    //     if(basketBuy[0].p_price !==0){
    //             navigate(
    //                 `/Order`,
    //                  {state : {basketBuy}}
    //             )}
    // },[basketBuy])

    
    return(
        <>
            <div className={styles.topSection}>
{/*            {isListCategory && ( //카테고리 상태에 의해 보여주냐 마냐*/}
                <span>
                    <Popup trigger={<button className={styles.topBtn} onClick={toggleWindow}><BiMenu /></button>}
                        position={"bottom left"}
                        nested
                        onOpen={() => {
                            console.log("Popup opened");
                            onmouseover = {selectHighCategory}
                        }}
                    >
                        <div className={styles.boxSide}>
                        <span className={`${styles.sideBar}`}>
                        <div>
                            <h4>카테고리</h4>
                        </div>
                        <div className={styles.categoryArea}>
                            <ul className={styles.list1}>
                                <li>상위 카테고리</li>
                                {

                                    categoryList.map((category) => (
                                        <>
                                            {
                                                category.cupCategory === null ?
                                                    <li className={`${styles.categoryList}`}>
                                                        <a href={category.ccode} className={`${styles.aNotSelect}`} onClick={click_selectPage} onMouseOver={selectHighCategory} key={category.ccode}>
                                                            {category.ccategoryName}
                                                        </a>
                                                    </li>
                                                    : null}
                                        </>
                                    ))
                                }
                            </ul>
                            <ul className={styles.list2}>
                                <li>하위 카테고리</li>
                                {

                                    isLowCategory && downCategory.map((category, index) => (
                                        <li key={category.ccode}>
                                            <a href={""} className={`${styles.aNotSelect}`} onClick={click_selectPage}>
                                                {category.ccategoryName}
                                            </a>
                                        </li>
                                    ))
                                }
                            </ul>
                        </div>
                    
                            </span>
                        </div>
                    </Popup>
                </span>
{/*}                )}*/}
                <span>
                    <img className={styles.mainLogo}src={logo}/>
                </span>
                <span>
                    <input className={styles.searchBar} type="text"/>
                    <button className={styles.searchBtn}>검색</button>
                </span>
                <span>
                    <Link to="/login"><button className={styles.topBtn}><BiUser /></button></Link>
                </span>
                <span>
                    <button className={styles.topBtn} onClick={toggleWindowB}><BiCart /></button>
                </span>
            </div>
            <div className={styles.mainSection}>
            <div className={`${isBasket ? styles.container2 : styles.container}`}>
            <hr></hr>
            {/*상품 상세정보 - 상품 이미지, 상품명, 가격, 옵션, 머시기 보이는곳*/}
            <div className={styles.box}>
                    <div className={styles.topBox}>
                        <div className={styles.left}>
                            <img src={image} className={styles.productImg}/>
                        </div>
                        <div className={styles.right}>
                            <h3>{details?.pname}</h3>
                            <hr></hr>
                            <h3>옵션</h3>
                            {
                                /**옵션 사항 출력 */
                                productOption.map((option, index)=>{
                                    return(
                                    <div  key={index}> 
                                            <input type={"radio"} name={"optionss"} value={option.opCode} onClick={optionChange}/> 
                                            옵션: {option.opOptionName}
                                    </div>
                                )})
                            }
                            <hr></hr>
                            <h3>수량</h3>
                            <input type={"number"} min={1} max={productOption.opQuantity} ref={productCountRef} onChange={countChange}/>
                            { 
                                totalPrice === 0 ?
                                <div>
                                    <hr></hr>
                                    <h3>가격</h3>
                                    <p>옵션을 선택해주세여</p>
                                </div>  :
                                <div>
                                    <hr></hr>
                                    <h3>가격</h3>
                                    <p>{totalPrice} 원</p>
                                </div>
                            }
                            <hr></hr>
                            <button onClick={isProductBuy}>상품 구매</button>
                            <button onClick={plusShopingBasket}>장바구니 담기</button>
                        </div>
                    </div>
                    <hr></hr>
                    <div>
                        <p>test</p>
                    </div>
                </div>
                {/*장바구니 */}
                {/* 일단 보류 카테고리 창과 함꼐 팝업 적용 시킬까 고민중 */}
                {isBasket && (
                    <div className={styles.boxRight}>
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
                                    <td><button id={index} className={`${styles.deleteBtn}`} onClick={delectProduct}>삭제</button></td>
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
                    <span><p>총 구매가</p><p>{basketTotalPrice}</p><button onClick={basketBuy}>구매</button></span>
                </div>
                )}
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