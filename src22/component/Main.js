import { Link, useNavigate, useParams } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {dataDomain} from "./common";

import { BiMenu,BiUser,BiCart } from "react-icons/bi";
import { BsSearch,BsPerson } from "react-icons/bs";

 import styles from "../public/css/Main.module.css";

import logo from "../public/background/logo.png";
import Popup from "reactjs-popup";

export default function Main(){
    const[isListCategory,setIsListCategory] = useState(true);   // isListCategory 카테고리창 보여주는 상태 관리, setIsListCategory 해당 상태를 변경하는 함수

    const[categoryList,setCategoryList] = useState([]);         // categoryList 카테고리 목록 저장하는 상태, setCategoryList 해당 상태를 변경하는 함수
    const[item, setItem] = useState([]);                        // item 상품 목록 저장하는 상태, setItem 해당 상태를 변경하는 함수
    const[basket, setBasket] = useState([]);                    // basket 상품 목록 저장하는 상태, setBasket 해당 상태를 변경하는 함수
    const {category} = useParams();                             // useParams 훅을 사용하여 현재 URL에서 동적으로 받아온 category값 가져옴
    const[selectPage,setSelectPage] = useState(category);       // selectPage는 현재 선택된 페이지(카테고리) 를 저장하는 상태

    function getCookie(name) {                                  // document.cookie 에서 쿠키 값을 가져오는 함수
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);                // 함수의 매개변수로 쿠키이름(name)을 전달하면 해당 쿠키의 값을 반환
        if (parts.length === 2) {
            return parts.pop().split(';').shift();
        }
    }

    const [totalPrice,setTotalPrice] = useState(); //총 구매가 계산
    useEffect(() => {                                                                   // useEffect 훅은 컴포넌트가 마운트 될 때, 특정 동작을 실행하는데 사용
        fetch(`${dataDomain}/product/product?p_category=${category}`)                   // 해당 URL로 get 요청을 보내서 특정 카테고리에 속한 상품 목록을 가져옵니다
            .then(res =>{return res.json()})                                            // 응답 데이터는 JSON 형식으로 반환되어 data에 저장
            .then(data =>{
                console.log(data);
                setItem(data);                                                          // 이걸 통해서 상태 item이 업데이트 되며 컴포넌트가 리 랜더링 됩니다
            })
            //console.log(getCookie('id'));

        if(getCookie('m_code') != null) {                                               // 현재 페이지에 쿠키에 m_code 값이 있는 경우에만 아래의 fetch를 실행
            fetch(`${dataDomain}/basket/member/mCode?mCode=${getCookie('m_code')}`)     // 쿠키에서 m_code 값을 가져와서 해당 회원의 장바구니 정보 가져옴
            .then(res =>{return res.json()})                                            // 응답 데이터는 json()(괄호 붙어야함) 형식으로 반환되어 data에 저장
            .then(data =>{
                // console.log(data);
                setBasket(data);
                let sum=0;
                data.map((data)=>sum=sum+(data.option.productInfo.psalePrice*data.bcount));
                setTotalPrice(sum);                                          // basket 상태 업데이트되며 컴포넌트가 리 랜더링 됨
            })
        }

        fetch(`${dataDomain}/category/all`)                                     // 모든 카테고리 가져오기
            .then(res =>{return res.json()})                                    /*json() 괄호 붙어야함*/
            .then(data =>{
            //  console.log(data);
                setCategoryList(data);                                          // categoryList 상태 업데이트되며 컴포넌트가 리 랜더링 됨
            });
    },[]);
    
    //여러 이미지 받아오는 코드
    const [image,setImage] = useState([]);

    useEffect(()=>{
        Promise.all(item.map((info)=> //패치의 비동기적 요청이 여러번 요청이 필요할때 사용
        fetch(`${dataDomain}/product/productImage?image=${info.pimageName}`)
        .then(res => res.blob())
        .then(imageBlob => URL.createObjectURL(imageBlob)) //이미지 이름을 통해 스프링부트 디렉토리에서 이미지를 가져온다
        )).then(images => {
            setImage(images);   //받아온 모든 이미지 파일 image상태 변수에 넣고
          }).catch(error => {
                console.error('Error fetching image:', error);
              });
    },[item])


    function toggleWindow() {                                                   // setIsListCategory 를 사용해서 isListCategory 상태를 토글
        setIsListCategory(!isListCategory);                                     // 예상 동작 : isListCategory 값을 변경하여 카테고리 창의 보여짐/숨김을 토글하는것
    }

    function click_selectPage(event) {                                          // 해당 함수는 카테고리를 선택했을 때의 동작을 정의
        const clickedElement = event.target;
        const textContent = clickedElement.textContent;                         // 클릭된 엘리먼트의 텍스트 내용을 가져와서 textContent에 저장
        setSelectPage(textContent);                                             // <<를 호출하여 selectPage 상태를 업데이트

        fetch(`${dataDomain}/product/product?p_category=${textContent}`)        // 해당 카테고리에 속한 상품 목록을 가져오기 위해 fetch 사용
            .then(res =>{return res.json()})
            .then(data =>{
                setItem(data);                                                  // << 를 호출하여 item 상태를 업데이트
                // console.log(data);                                              // 콘솔에 데이터 출력
            })
        event.preventDefault();                                                 // << 를 호출하여 기본 동작을 막는다 - 페이지 새로고침 등을 방지합니다
    }
    /**카테고리 랜더링 */
    const [downCategory,setDownCategory] = useState();
    const [isLowCategory,setIsLowCategory] = useState(false);                   // 카테고리 추가 누를시 표시되는 window의 상태

    

    /**상위 카테고리가 선택이 된다면 그 밑에 하위 카테고리가 나올수있게 설정 */
    function selectHighCategory(event) { 
        const finder=categoryList.find((category)=> category.ccategoryName === event.target.textContent);   // 클릭된 엘리먼트의 텍스트 내용을 가져와서 event.target.textContent에 저장
        const lowCategoryes=categoryList.filter((category)=>finder.ccode+''===category.cupCategory);        // categoryList 배열에서 해당 이름을 가진 카테고리를 찾아 finder에 저장 / '' 를 붙여줌으로써 text 형태로 형변환 해주는게 가능
                                                                                                            // finder.ccode 와 일치하는 cupCategory 값을 가진 카테고리들을 filter를 사용하여 찾아
        // console.log(finder.ccode);
        // console.log(lowCategoryes);
        setDownCategory(lowCategoryes);                     // lowCategores에 저장
        setIsLowCategory(true);                             // << 를 호출하여 하위 카테고리 창을 표시
    }
    function click_productDetails(event) {                  // 상품의 세부 정보를 보기 위해 클릭한 경우의 동작 정의
        const clickedElement = event.target;                // 클릭된 엘리먼트의 텍스트 내용을 가져와서 textContent에 저장, 현재는 텍스틑 내용만 가져오고 특별한 동작은 수행하지 않습니다
        const textContent = clickedElement.textContent;
    }
    
    /**신상품 중고 표시하는 상품 바뀌게 보이는 부분 true = 신상품 , false*/
    const [productState,setProductState] = useState(true); /** true = 신상품 , false = 중고 */

    function changeProductState(event) {                                                        // 신상품 또는 중고 버튼이 클릭되었을 때의 동작을 정의
        event.target.textContent === "신상품" ? setProductState(true):setProductState(false);   // 클릭된 엘리먼트의 텍스트 내용을 가져와서 비교하고 해당 내용에 따라 setProductState를 호출해서 상태 변경
    }

    /**상품 검색*/
    const searchInput = useRef(null);                               // 입력란에 대한 참조를 생성

    function searchProduct(event) {                                  // 상품 검색 수행
        fetch(`${dataDomain}/product/productSearch?pName=${searchInput.current.value}`)        // 서버에 상품 검색 요청을 보냄
        .then(res=>{return res.json()})                             // JSON 형태 반환 data에 저장
        .then(data=>{
            setItem(data);                                          // item 상태 업데이트
        })

    }
    /** 장바구니에서 구매 클릭시  */
    const navigate = useNavigate();             // 훅을 사용하여 페이지 이동을 위한 함수 생성

    function basketBuy() {                      // 장바구니에서 구매 버튼이 클릭되었을 때의 동작 정의
        navigate(
            `/Order/${basket.m_code}`,          // navigate 함수를 사용해서 page 이동
        )
    }
    

    
    // html 부분
    return (
        <body class="sb-nav-fixed">
            {/**상단 */}
            <nav className={"sb-topnav navbar navbar-expand navbar-dark bg-dark"}>
                <span>
                    <button className={"btn btn-link btn-sm order-1 order-lg-0 me-4 me-lg-0"} onClick={toggleWindow}><BiMenu /></button>
                </span>
                <span>
                    <Link to="/main"><a class="navbar-brand ps-3" href="">SW Shop</a></Link> {/* image */}
                </span>
                {/**검색창 */}
                <span>
                    <form className={"d-none d-md-inline-block form-inline ms-auto me-0 me-md-3 my-2 my-md-0"}>
                        <div className={"input-group"}>
                            <input className={"form-control"} type="text" ref={searchInput}/>
                            <button className={"btn btn-primary"} id="btnNavbarSearch"
                            onClick={searchProduct}
                            ><BsSearch /></button>
                        </div>
                    </form>
                </span>
                {/**로그인 누르면 나오는 부분 */}

                <span>
                    <Link to="/login"><button className={"navbar-nav ms-auto ms-md-0 me-3 me-lg-4"}><BsPerson /></button></Link>
                </span>
                <span>
                     {/**장바구니 팝업 */}
                    <Popup trigger={<button className={"navbar-nav ms-auto ms-md-0 me-3 me-lg-4"}><BiCart /></button>}
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
                        <span><p>총 구매가</p><p>{totalPrice}</p><button onClick={basketBuy}>구매</button></span>
                    </div>
                    </Popup>
                </span>
            </nav>
            {/**상단 */}
            {/**중단 */}
            <div id="layoutSidenav">
            <div id="layoutSidenav_nav">
                {isListCategory && ( //카테고리 상태에 의해 보여주냐 마냐
                <nav class="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                   <div class="sb-sidenav-menu">
                    <div className="nav">
                        <div className="sb-sidenav-menu-heading">카테고리</div>
                        <div className="sb-sidenav-menu-heading">상위 카테고리</div>
                                {
                                categoryList.map((category) => (
                                    <>
                                        {
                                        category.cupCategory === null ?
                                                <a href={category.ccode} className={`${styles.aNotSelect}`} onClick={click_selectPage} onMouseOver={selectHighCategory} key={category.ccode}>
                                                    {category.ccategoryName}
                                                </a>
                                                
                                            : null}
                                    </>
                                ))
                                }
                     <div className="sb-sidenav-menu-heading">하위 카테고리</div>
                                {

                                    isLowCategory && downCategory.map((category, index) => (
                                        <li key={category.ccode}>
                                            <a href={""} className={`${styles.aNotSelect}`} onClick={click_selectPage}>
                                                {category.ccategoryName}
                                            </a>
                                        </li>
                                    ))
                                }
                        </div>
                        </div>
                </nav>
                )}
                </div>
                </div>
                <div id="layoutSidenav_content">
                <main>
                <div className="container-fluid px-4">
                
                    <>
                    <h1 className="mt-4">{selectPage}</h1>
                    <ol className="breadcrumb mb-4">
                        <li className="breadcrumb-item active">Dashboard</li>
                    </ol>
                    <div className="row">
                        {
                            item.map((items,index)=>(
                                /**4개가 나오면 tr태그 추가하고  
                                * 데이터를 긁어오고 그리고 태그를 누르면 패치를 통해서 json파일 가져오기 
                                */

                                <div className="col-xl-3 col-md-6">
                                <div className="card bg-primary text-white mb-4">
                                    <div clasName="card-body">
                                        <img className={`${styles.objectImg}`}src={image[index]}/>
                                        <p>{items.pname}</p>
                                        <p>{items.psalePrice}</p>
                                    </div>
                                    <div className="card-footer d-flex align-items-center justify-content-between">
                                    <Link to={"/ProductDetail/"+items.pcode}> <a className="small text-white stretched-link" href="#"onClick={click_productDetails}>View Details</a></Link>
                                        <div className="small text-white"><i className="fas fa-angle-right"></i></div>
                                    </div>
                                </div>
                                </div>
                               
                        ))
                        }
                    </div>

                    </>
                </div>
                </main>
            </div>
            {/**중단 */}
            {/**하단 */}
            {/* <div className={styles.footSection}>
            <hr></hr>
                <h1>Foot Section</h1>
                <Link to='/'><p>test</p></Link>
            </div> */}
            {/**하단 */}
        </body>
    );
}