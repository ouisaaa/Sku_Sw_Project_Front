import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {dataDomain} from "./common";

import { BiUser} from "react-icons/bi";
import styles from "../public/css/Seller.module.css";
import logo from "../public/background/logo.png";


export default function Seller(){
    const[selectPage,setSelectPage]=useState("매출통계");
    const[productOption,setProductOption] = useState([]);

    /** 판매자 상품 페이지 옮기는 기능 */
    function click_selectPage(event){
        event.preventDefault();
        const clickedElement = event.target;
        const textContent = clickedElement.textContent;
        setSelectPage(textContent);
    }
    /**상품 관리 */
    const [saleProduct,setSaleProduct] = useState([]); 
    /**주문 내역 */
    const[orderProduct,setOrderProduct]=useState([]);

    //상세주문내역
    const [orderProductDetail,setOrderProductDetail] = useState([]);
    //옵션
    const[inputProduct,setInputProduct] = useState([]);

    //상품 옵션들
    const[optionProductList,setOptionProductList]=useState();

    useEffect(()=>{
        /** 상품관리 정보 요청*/
    //  fetch(`${dataDomain}/product/`)
    //     .then(res=>{return res.json()})
    //     .then(data=>{
    //         console.log("sp: "+data[0]);
    //         setSaleProduct(data);
    //     });

    /**카테고리 가져오기 */
    fetch(`${dataDomain}/category/all`)//모든 카테고리 가져오기
        .then(res =>{return res.json()}) /*json() 괄호 붙어야함*/
        .then(data =>{
           // console.log(data);
            setCategoryList(data); 
        });
    /**옵션 가져오기 */
    fetch(`${dataDomain}/option/`)//모든 카테고리 및 상품 정보 가져오기
        .then(res =>{return res.json()}) /*json() 괄호 붙어야함*/
        .then(data =>{
           let productInfo=[];
           let option = [];

           data.map((data)=>productInfo.push(data.productInfo));
           data.map((data)=>option.push({
            "opCode":data.opCode,
            "opOptionName":data.opOptionName,
            "opQuantity":data.opQuantity,
            "pcode":data.productInfo.pcode
           }))

           console.log(option);
           const setData=productInfo.filter((item, index, self)=>index===self.findIndex((t)=>t.pcode===item.pcode));
            setSaleProduct(setData); 
            setOptionProductList(option);
            
           
            // console.log(setData);
            // console.log(productInfo);
        });
    fetch(`${dataDomain}/product/input`)//입고 내역
        .then(res =>{return res.json()}) /*json() 괄호 붙어야함*/
        .then(data =>{
            //console.log("op: "+data[0]);
            setInputProduct(data); 
        });
       //상품 주문 상세정보 받아오기 
    fetch(`${dataDomain}/order/detail`)
        .then(res=>{return res.json()})
        .then(data=>{
           console.log(data);
            setOrderProduct(data.order);
            setOrderProductDetail(data);
        });
    },[]);

    
    /** ******************************* *******************************카테고리 ************************************* *******************************/
    /* 옵션 추가 */
    const options = useRef(null);
    const optionPrice = useRef(null);

    // function click_optionPlus(event){
    //     event.preventDefault();
    //     //{옵션 : 가격} 이런 식으로 저장
    //     const temp1=options.current.value;
    //     const temp2=optionPrice.current.value;
    //     setProductOption({...productOption,[temp1]:temp2});
    //     console.log(productOption);
    // }
    
    /**옵션 추가하는 창 보여주게 */
    const[isAddOption,setIsAddOption] = useState(false);

    //옵션명을 추가를 함으로 상품 옵션에 추가
    function isOptionPlus(event){
        event.preventDefault();
        setIsAddOption(true);

        const temp=options.current.value;
        setProductOption([...productOption,temp]);
    }

    function deleteOption(event){
        const tempOption = [...productOption]
        setProductOption(tempOption.filter((item,index)=> index != event.target.value));
    }
    
    /**그림 파일 랜더 함수 */
    const [file, setFile] = useState(null);

    function fileRender(event){
        const selectedFile = event.target.files[0];

        setFile(selectedFile);
        // if(selectedFile){
        //     const render = new FileReader();
        //     render.readAsDataURL(selectedFile);
        //     render.onload=()=>{
        //         setFile(render.result);
        //     }
        // } 
    }
    
    /** 상품 등록 */
    const highCategoryRef = useRef(null);
    const lowCategoryRef = useRef(null);
    const productName=useRef(null); //상품 이름 가져오기
    const productSalePrice =useRef(null); //판매가 정보 가져오기
    const productPrice=useRef(null);
    const productContext = useRef(null);

    //이거 어ㄷ케할지 확인 ㄱㄱ
    //상품 등록
    function postProduct(){
        const productInformation={
            "p_name": productName.current.value,
            "p_price": parseInt(productPrice.current.value,10),
            "p_content": productContext.current.value,
            "p_salePrice": parseInt(productSalePrice.current.value,10),
            "category": {
                "CCode": parseInt(lowCategoryRef.current.value,10),
                "CCategoryName": selectCategory,
                "cupCategory":highCategoryRef.current.value+'',
            }
        }
        let productOptionList=[];
        productOption.map((option,index)=>(
            productOptionList.push({
                "op_option_name":option,
                "op_quantity":0,
            })
        ))
        // productInformation.id="test9"
        // productInformation.p_code="mmdkvndi"
        // console.log(productInformation);

        const formData = new FormData();
        console.log(file);
        
        formData.enctype="multipart/form-data";
        formData.append("image",file);
        console.log(productInformation);

        fetch(`${dataDomain}/product/newProductImage`,
        {
            method:"POST",
            body : formData
        }).then(res =>{if (res.ok ){
                alert("check")
                fetch(`${dataDomain}/product/newProduct`,
                {
                    method:"POST",
                    headers:{
                         'Content-Type':"application/json",
                    },
                    body : JSON.stringify(productInformation)
                }
                ) .then(res =>{
                        if (res.ok ){
                            alert("check")
                            fetch(`${dataDomain}/option/newProduct`,
                            {
                                method:"POST",
                                headers: {
                                    'Content-Type':"application/json",
                                },
                                body : JSON.stringify(productOptionList)
                            }).then(res =>{
                                if (res.ok ){
                                    alert(   "상품 등록 완료"); 
                                    window.location.reload();
                                }});
                        }
                    });

            }});
        
        
    }
    /** ******************************* *******************************상품등록 ************************************* *******************************/
    /** */
    /** ******************************* *******************************카테고리 ************************************* *******************************/
    const[categoryList,setCategoryList] = useState([]);//현재 존재하는 카테고리 가져오기
    const[highCategory,setHighCategory] = useState([]);//상위 카테고리
    const[lowCategory,setLowCategory] = useState([]); //하위 카테고리


    //카테고리 추가를 누르면 카테고리를 추가할수있는 레이아웃이 나올수있게
    const [isCategoryPlus,setIsCategoryPlus]=useState(false);

    function changeCategoryState(){
        setIsCategoryPlus(!isCategoryPlus);
    }
    useEffect(()=>{
        let temp =[];

        categoryList.map((category)=>(
            category.cupCategory === null ?
            temp.push(category) :null
        ))
        setHighCategory(temp);

    },[categoryList])

    /**상위 카테고리가 선택이 된다면 그 밑에 하위 카테고리가 나올수있게 설정 */
    function selectHighCategory(){
        let temp =[];

        categoryList.map((category)=>(
            category.cupCategory === highCategoryRef.current.value+'' ? 
            temp.push(category) : null
        ))

        setLowCategory(temp);
        setIsLowCategory(true);
    }

    const [isLowCategory,setIsLowCategory]=useState(false); //카테고리 추가 누를시 표시되는 window의 상태
    

    const newHCRef = useRef(null); //상위 카테고리 추가 하는 변수
    const newCategoryRef = useRef(null); //추가 카테고리 변수 
    //카테고리 추가
    function categoryPlus(){
        const newCategoryParent = categoryList.find((index)=> index.ccategoryName === newHCRef.current.value);
        const newCategory = {
            "c_code": parseInt(categoryList[categoryList.length-1].ccode,10)+1,
            "c_category_name": newCategoryRef.current.value,
            "c_up_category": newCategoryParent.ccode
        }
        
        // console.log(newCategory);
        fetch(`${dataDomain}/category/newCategory`,
        {
            method:"Post",
            headers: {
                'Content-Type':"application/json",
            },
            body : JSON.stringify(newCategory)
        }).then(res =>{if (res.ok ){
            alert(   "등록"); 
            setCategoryList([...categoryList,newCategory]);
            setIsCategoryPlus(false);
        }})
    }
    const [selectCategory,setSelectCategory]= useState(null);

    function selectCategoryName(event){
        const selectCCategoryName = categoryList.find((category)=>category.ccode === parseInt(event.target.value,10));
        setSelectCategory(selectCCategoryName.ccategoryName);
    }
    /** ******************************* *******************************카테고리 ************************************* *******************************/
    
    //** ******************************* *******************************상품 관리 /** ******************************* *******************************/
    /**상품관리 수정 클릭시 */
    const [modifyTr,setModifyTr] = useState();//수정창 표시 여부 true >> 표시 false >> X

    useEffect(()=>{ //saleProduct의 상태값이 달라지면 해당 코드들이 실행
        const tempState = Array(saleProduct.length).fill(false);//이렇게 false로 채워진 상태 배열이 된다
        setModifyTr(tempState);
        setIsReceiveProduct(tempState);

        const tempState2 =Array(saleProduct.length).fill('white');
        setChangeStockState(tempState2);
        setChangeModifyState(tempState2);

        setNewStockProduct([...saleProduct]);
        setNewProdcutInformation([...saleProduct]);
    },[saleProduct])
    

    //상품 관리 창에서 상품 정보 수정할떄 사용할 창 표시하거나 끄는 역할
    function modifyInformation(event){
        const updatedStates = [...modifyTr];

        event.target.textContent === "수정" ? 
        updatedStates[event.target.value]=true
        :updatedStates[event.target.value]=false
        
        setModifyTr(updatedStates);
        console.log(modifyTr)
    }

    const modifyNameRef=useRef(null); //수정할 이름 값 가져오기
    const modifyOptionRef=useRef(null);//수정할 옵션값 가져오기
    const modifyPriceRef=useRef(null);//수정할 가격 값 가져오기
    const modifySalePriceRef=useRef(null);//수정할 판매가 값 가져오기 
    const modifyCategoryName = useRef(null); //수정할 카테고리값 가져오기
    const modifyOptionCurser = useRef(null); //수정할 옵션 이름 커서

    //상품 수정 시 수정된 값 적용하고 수정된 부분 표시
    const [changeModifyState,setChangeModifyState] =useState(); //수정된 사항이 있음 표시
   // const [isModifyProduct,setIsModifyProduct] = useState(); //입고 정보 수정 사항 저장 
    const [newProductInformation,setNewProdcutInformation] = useState(); //새로운 상품 정보를 저장하는 상태


    //카테고리 상품 설정
    function updateCategory(){
        const findUpdateCategory=categoryList.find((category)=>category.ccode==modifyCategoryName.current.value);//카테고리 수정된 사항을 통해 관련 정보 추출
        const updateModifyCategory={
            "category":null,
            "cupCategory":findUpdateCategory.cupCategory,
            "ccategoryName":findUpdateCategory.ccategoryName,
            "ccode": findUpdateCategory.ccode
        };
        return updateModifyCategory;
    }

    //옵션 수정사항
    function updateOptionFunction(pcode){
        let updateOption=[...optionProductList];

        console.log("ipd:  "+updateOption);
        for(let i=0;i<updateOption.length;i++){
            if(updateOption[i].opCode === parseInt(modifyOptionCurser.current.value,10)){
                updateOption[i].opOptionName=modifyOptionRef.current.value;
            }
        }
        return updateOption;
       
    }
    /**상품의 변경사항 저장 -> 프론트에서만 */
    function modifyUpdate(event){
        const updateModify=[...newProductInformation];
       
        console.log(updateModify[event.target.value].pcode);
        updateModify[event.target.value].pname = modifyNameRef.current.value==="" ? updateModify[event.target.value].pname:modifyNameRef.current.value;
        updateModify[event.target.value].category = modifyCategoryName.current.value==="--하위카테고리--" ? updateModify[event.target.value].category : updateCategory();
        updateModify[event.target.value].opOptionName=modifyOptionRef.current.value===null ? updateModify[event.target.value].opOptionName:modifyOptionRef.current.value;
        updateModify[event.target.value].pprice = modifyPriceRef.current.value ==="" ? updateModify[event.target.value].pprice :modifyPriceRef.current.value;
        updateModify[event.target.value].psalePrice = modifySalePriceRef.current.value === "" ? updateModify[event.target.value].psalePrice :modifySalePriceRef.current.value ;

        console.log(updateOptionFunction(updateModify[event.target.value].pcode));

        // updateModifyObserver[event.target.value]='red';

        modifyTr[event.target.value] = false;
        // setChangeModifyState(updateModifyObserver);
        
        fetch(`${dataDomain}/product/modifyProduct`,{
                method:"PUT",
                headers: {
                    'Content-Type':"application/json",
                },
                body : JSON.stringify(updateModify)
            }).then(res=>{
                if(res.ok){
                    alert("등록 완료");
                    fetch(`${dataDomain}/option/modifyOption`,{
                        method:"PUT",
                        headers: {
                            'Content-Type':"application/json",
                        },
                        body : JSON.stringify(updateOptionFunction(updateModify[event.target.value].pcode))
                    }).then(res=>{
                        if(res.ok){
                            alert("등록 완료");
                            setNewProdcutInformation(updateModify);
                            setOptionProductList(updateOptionFunction(updateModify[event.target.value].pcode));
                        }
                    })
                }
            })
    }
    //상품 삭제
    function deleteUpdate(event){
        const confirmed = window.confirm("정말 삭제 하시겠습니까?");
        const getImageName = saleProduct[event.target.value-1].pimageName;

        if(confirmed){
            fetch(`${dataDomain}/product/product?pcode=${event.target.value}&image=${getImageName}`,{
                method:"DELETE",
                headers: {
                    'Content-Type':"application/json",
                },
            }).then(res=>{
                if(res.ok){
                    alert("삭제 완료");
                    window.location.reload();
                }
            })
        }
    }

   
    //** ******************************* *******************************상품 관리 /** ******************************* *******************************/
    //** ******************************* *******************************상품 입고 /** ******************************* *******************************/
    const [isReceiveProduct,setIsReceiveProduct] = useState();//수정창 표시 여부 true >> 표시 false >> X
    const [changeStockState,setChangeStockState] =useState(); //수정된 사항이 있음 표시
    const stockRef = useRef(null); //추가 재고량 받아오는 변수
    const [newStockProduct,setNewStockProduct] = useState(); //입고 정보 수정 사항 저장 

    //상품 입고 클릭시
    function receiveProduct(event){
        const updatedStates = [...isReceiveProduct];

        event.target.textContent === "입고" ? 
        updatedStates[event.target.value]=true
        :updatedStates[event.target.value]=false
        
        console.log(event.target.value);
        setIsReceiveProduct(updatedStates);
    }
    const[productInputInfo,setProductInputInfo]=useState([]);

    /**상품 입고 개수 반영 -> 프론트에서만 */
    function stockUpdate(event){
        // const updateStockObserver =[...changeStockState];
        // console.log(updateStock[event.target.value]);
        // console.log(optionProductList[event.target.value]);
        // console.log(event.target.value);
        
        const input = optionProductList.find((option)=> option.opCode===parseInt(event.target.value,10)); //재고량 수정 하기위한 바뀐 부분 찾기
        const Iproduct = newStockProduct.find((product)=>product.pcode===input.pcode); //입고 기록을 남기기 위한 상품 정보 찾기
    
        console.log(Iproduct);
        const saveInputInfo={
            "i_quantity":parseInt(stockRef.current.value),
            "p_name":Iproduct.pname,
            "c_category_name":Iproduct.category.ccategoryName,
            "op_code":input.opCode,
            "op_option_name":input.opOptionName
        }
        input.opQuantity=parseInt(input.opQuantity)+parseInt(stockRef.current.value);
        //updateStockObserver[event.target.value] = 'red';

        isReceiveProduct[event.target.value-1] = false;
        console.log(saveInputInfo);
        console.log(input);
        // setChangeStockState(updateStockObserver);
        // setNewStockProduct(updateStock);
        fetch(`${dataDomain}/product/inputProduct`,{
            method:"PATCH",
            headers: {
                'Content-Type':"application/json",
            },
            body : JSON.stringify(input)
        }).then(res =>{if (res.ok ){
            alert(   "등록"); 
            fetch(`${dataDomain}/product/productInput `,{
                method:"POST",
                headers: {
                    'Content-Type':"application/json",
                },
                body : JSON.stringify(saveInputInfo)
            }).then(res =>{
                if(res.ok){
                    alert("등록 완료")
                     setProductInputInfo([...productInputInfo,saveInputInfo]);
                }
            })
        }})
        
    }

    
    return(
        <>
            <div className={styles.topSection}>
                <span>
                    <img className={styles.mainLogo}src={logo}/>
                </span>
                <span>
                    <Link to="/login"><button className={styles.topBtn}><BiUser /></button></Link>
                </span>
            </div>
            <hr></hr>
            <div>
                <span>
                    {/* <button className={styles.btn}onClick={click_selectPage}>매출통계</button> */}
                    <button className={styles.btn}onClick={click_selectPage}>상품등록</button>
                    <button className={styles.btn}onClick={click_selectPage}>상품관리</button>
                    <button className={styles.btn}onClick={click_selectPage}>상품입고</button>
                    <button className={styles.btn}onClick={click_selectPage}>입고기록</button>
                    <button className={styles.btn}onClick={click_selectPage}>주문내역</button>
                </span>
            </div>
            <div className={styles.container}>
                <hr></hr>
                {/* {selectPage=="매출통계" ? (
                    <div className={`${styles.box} ${styles.sales}`}>
                        <span className={`${styles.twoSpanDivider}`}>
                            <div>
                                <div>총 주문 건수</div>
                                <div>여기에 주문 건수를 표시하기</div>
                            </div>
                        </span>
                        <span> 
                            <div>
                                <div>매출액</div>
                                <div>000000원</div>
                            </div>
                        </span>
                    </div>
                ): null} */}
                {selectPage=="상품등록" ? (
                    <div className={`${styles.box}`}>
                    <form action="#">
                        <table className={`${styles.register}`}>
                            <thead>
                                <tr>
                                    <th colSpan="2"security="">상품 등록</th>
                                </tr>
                            </thead>
                            <tbody>
                                    <tr>
                                        <td>
                                            <p>상품 카테고리</p>
                                        </td>
                                        <td>
                                            <select ref={highCategoryRef} onChange={selectHighCategory}>
                                                <option value={null}>--상위카테고리--</option>
                                                {
                                                    highCategory.map((category,index)=>(
                                                            <option key={index} value={category.ccode}>{category.ccategoryName}</option>
                                                    ))
                                                }
                                            </select>
                                            
                                            <select ref={lowCategoryRef} 
                                            onChange={selectCategoryName}
                                            >
                                                
                                                <option value={null}>--하위카테고리--</option>
                                                {
                                                    isLowCategory && lowCategory.map((category,index)=>(
                                                            <option key={index} value={category.ccode}>{category.ccategoryName}</option>
                                                    ))
                                                }
                                            </select>
                                            
                                            
                                            <button className={`${styles.btn}`}onClick={changeCategoryState}>카테고리 추가</button>
                                            {isCategoryPlus &&(
                                                <>
                                                <hr></hr>
                                                <p>카테고리</p>
                                                    <table className={styles.categoryShow}>
                                                        <thead>
                                                            <tr>
                                                                <th>상위 카테고리</th>
                                                                <th>카테고리 id</th>
                                                                <th>카테고리 명</th>
                                                                <th>삭제</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            
                                                    {
                                                        categoryList.map((category,index)=>(
                                                            <tr key={index}>
                                                                <td>{category.cupCategory}</td>
                                                                <td>{category.ccode}</td>
                                                                <td>{category.ccategoryName}</td>
                                                                <td><button>삭제</button></td>
                                                            </tr>
                                                            )
                                                    )}
                                                    </tbody>
                                                    </table>
                                                    <hr></hr>
                                                     {/* input 클릭을 하면 카테고리리스트 나오고 리스트안에 직접 입력도 있어서 직접 입력을 하는 형식 
                                                     한번 구현 트라이*/}
                                                    <input type="text" ref={newHCRef}placeholder="상위 카테고리 입력"/>
                                                    <input type="text" ref={newCategoryRef}placeholder="추가할 카테고리 입력"/>
                                                    <button onClick={categoryPlus}>추가</button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label>상품 이름</label>
                                            </td>
                                            <td>
                                            <input type="text" ref={productName}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td >
                                            <label>상품 옵션</label>
                                        </td>
                                        <td>
                                            <input type="text" ref={options} placeholder="옵션 명을 입력후 추가 눌러주세요"/>
                                            <button onClick={isOptionPlus}>옵션 추가</button>
                                            
                                                {isAddOption &&(
<>
                                                    <table className={styles.tabler}>
                                                        <thead>
                                                            <tr>
                                                                <th colSpan={2}>상품 옵션</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            <tr>
                                                                <td>옵션명</td>
                                                                <td>삭제</td>
                                                            </tr>
                                                            {
                                                                productOption.map((option,index)=>(
                                                                    <tr>
                                                                        <td>{option}</td>
                                                                        <td><button className={styles.optionBtn} value={index} onClick={deleteOption}>삭제</button></td>  
                                                                    </tr>
                                                                ))
                                                            }
                                                        </tbody>
                                                    </table>
                                                    </>
                                                )}   
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label>상품 가격</label>
                                            </td>
                                            <td>
                                            <input type="text" ref={productPrice}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label>상품 판매가</label>
                                            </td>
                                            <td>
                                            <input type="text" ref={productSalePrice}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label>상품 설명</label>
                                            </td>
                                            <td>
                                            <textarea className={styles.contextBox}ref={productContext}/>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <label>상품 그림</label>
                                            </td>
                                            <td>
                                            <input type="file" onChange={fileRender}/>
                                        </td>
                                    </tr>
                            </tbody>
                        </table>
                        <hr></hr>
                        <button onClick={postProduct}>등록</button>
                        </form>
                    </div>
                ): null}
                {
                selectPage=="상품관리" ? (
                   <div className={`${styles.box}`}>
                   <div className={`${styles.order}`}>
                       <table className={`${styles.tabler}`}>
                           <thead>
                               <tr>
                                <th colSpan="18">
                                    상품관리
                                </th>
                               </tr>
                           </thead>
                           <tbody>
                               <tr>
                                    <td colSpan={1}>상품코드</td>
                                   <td colSpan={3}>상품이름</td>
                                   <td colSpan={2}>카테고리</td>
                                   <td colSpan={2}>옵션</td>
                                   <td>그림</td>
                                   <td colSpan={3}>가격</td>
                                   <td colSpan={3}>판매가</td>
                                   <td colSpan={1}>수정</td>
                                   <td colSpan={1}>삭제</td>
                               </tr>
                               {
                                    newProductInformation.map((saleProduct,index)=>{
                                        return (
                                        <>
                                        <tr key={index}>
                                            <td colSpan={1} style={{backgroundColor: changeModifyState[index]}}>{saleProduct.pcode}</td>
                                            <td colSpan={3} style={{backgroundColor: changeModifyState[index]}}>{saleProduct.pname}</td>
                                            <td colSpan={2} style={{backgroundColor: changeModifyState[index]}}>{saleProduct.category.ccategoryName}</td>
                                            <td colSpan={2}style={{backgroundColor: changeModifyState[index]}}>
                                                <ol>
                                                   {
                                                    optionProductList.filter((option)=>{
                                                        return option.pcode === saleProduct.pcode}).map((item)=>{
                                                            return (<li key={item.opCode}>{item.opOptionName}</li>);
                                                    })
                                                   }
                                                </ol>
                                            </td>
                                            <td style={{backgroundColor: changeModifyState[index]}}>{saleProduct.pimageName}</td>
                                            <td colSpan={3} style={{backgroundColor: changeModifyState[index]}}>{saleProduct.pprice}</td>
                                            <td colSpan={3} style={{backgroundColor: changeModifyState[index]}}>{saleProduct.psalePrice}</td>
                                            <td><button className={styles.optionBtn} onClick={modifyInformation}value={index}>수정</button></td>
                                            <td><button className={styles.optionBtn} value={saleProduct.pcode} onClick={deleteUpdate}>삭제</button></td>
                                        </tr>
                                        {
                                        modifyTr[index] && (
                                            <>
                                            <tr>
                                                <td colSpan={1}></td>
                                                <td colSpan={3}><input type="text" placeholder="수정할 이름" className={styles.inputWidth} ref={modifyNameRef} /></td>
                                                <td colSpan={2}>
                                                {/* <input type="text" placeholder="수정할 카테고리" className={styles.inputWidth} ref={modifyCategoryName}/> */}
                                                <select ref={highCategoryRef} onChange={selectHighCategory}>
                                                        <option value={null}>--상위카테고리--</option>
                                                        {
                                                            highCategory.map((category,index)=>(
                                                                    <option key={index} value={category.ccode}>{category.ccategoryName}</option>
                                                            ))
                                                        }
                                                    </select>
                                                    
                                                    <select ref={modifyCategoryName} 
                                                    onChange={selectCategoryName}
                                                    >
                                                        
                                                        <option value={null}>--하위카테고리--</option>
                                                        {
                                                            isLowCategory && lowCategory.map((category,index)=>(
                                                                    <option key={index} value={category.ccode}>{category.ccategoryName}</option>
                                                            ))
                                                        }
                                                 </select>
                                                    </td>
                                                <td colSpan={2}>
                                                    <select ref={modifyOptionCurser}>
                                                        <option value={null}>--수정할옵션--</option>
                                                        {
                                                            optionProductList.filter((optionList)=>optionList.pcode === saleProduct.pcode).map((option,index)=>(
                                                                    <option key={index} value={option.opCode}>{option.opOptionName}</option>
                                                            ))
                                                        }
                                                    </select>
                                                    <input type="text" placeholder="수정내용" className={styles.inputWidth} ref={modifyOptionRef}/>
                                                    
                                                </td>
                                                <td></td>
                                                <td colSpan={3}><input type="number" placeholder="수정할 가격" className={styles.inputWidth} ref={modifyPriceRef}/></td>
                                                <td colSpan={3}><input type="number" placeholder="수정할 판매가" className={styles.inputWidth} ref={modifySalePriceRef}/></td>
                                                <td><button className={styles.optionBtn}value={index} onClick={modifyUpdate}>완료</button></td>
                                                <td><button className={styles.optionBtn}value={index} onClick={modifyInformation}>취소</button></td>
                                            </tr>
                                            </>
                                        )}
                                        </>
                            )})              
                                }
                           </tbody>
                       </table>
                   </div>
               </div>
                ): null}
                {selectPage=="상품입고" ? (
                   <div className={`${styles.box}`}>
                   <div className={`${styles.order}`}>
                       <table className={`${styles.tabler}`}>
                           <thead>
                               <tr>
                                <th colSpan="18">
                                    상품입고
                                </th>
                               </tr>
                           </thead>
                           <tbody>
                               <tr>
                                   <td colSpan={3}>상품코드</td>
                                   <td colSpan={3}>상품이름</td>
                                   <td colSpan={2}>옵션</td>
                                   <td colSpan={2}>정가</td>
                                   <td colSpan={2}>가격</td>
                                   <td>수량</td>
                                   <td>수량 입고</td>
                               </tr>
                               {
                                    
                                    newStockProduct.map((product,index)=>{
                                        return(
                                            optionProductList.filter((option)=>product.pcode===option.pcode).map((option,J) =>{
                                                return (
                                                    <>
                                                    <tr key={optionProductList.opCode}>
                                                        <td colSpan={3}>{product.pcode}</td>
                                                        <td colSpan={3}>{product.pname}</td>
                                                        <td colSpan={2}>{option.opOptionName}</td>
                                                        <td colSpan={2}>{product.pprice}</td>
                                                        <td colSpan={2}>{product.psalePrice}</td>
                                                        <td id={index} style={{backgroundColor: changeStockState[index]}}>{option.opQuantity}</td>
                                                        <td><button value={option.opCode-1} className={styles.optionBtn} onClick={receiveProduct}>입고</button></td>
                                                    </tr>
                                                {/**이 코드는 백에서요청을 하면 옵션들을 끼워서 옵션 단위 별로 자세하게 나올수 있도록 표시를 해준다 */}
                                                    {
                                                        isReceiveProduct[option.opCode-1] && (
                                                            <tr>
                                                                <td colSpan={7}><input type="text" placeholder="추가 수량" className={styles.inputWidth} ref={stockRef}/></td>
                                                                <td colSpan={3}><button className={styles.optionBtn}value={option.opCode} onClick={stockUpdate}>완료</button></td>
                                                                <td colSpan={2}><button className={styles.optionBtn}value={option.opCode-1} onClick={receiveProduct}>취소</button></td>
                                                            </tr>
                                                        
                                                        )}
                                                    </>
                                            )
                                            })
                                    )
                                    }
                                    )
                                }
                           </tbody>
                       </table>
                   </div>
               </div>
                ): null}
                 {selectPage=="입고기록" ? (
                   <div className={`${styles.box}`}>
                   <div className={`${styles.order}`}>
                       <table>
                           <thead>
                               <tr>
                                <th colspan="10">
                                    입고기록
                                </th>
                               </tr>
                           </thead>
                           <tbody>
                               <tr>
                                   <td>삭제</td>
                                   <td>상품코드</td>
                                   <td>상품이름</td>
                                   <td>옵션</td>
                                   <td>수량</td>
                                   <td>날짜</td>
                                   <td>정가</td>
                               </tr>
                               {/*여기에 주문 내역 가져와서 쫙 볼수있게 */}
                               {
                                inputProduct.map((input,index)=>(
                                    <tr key={index}>
                                        <td><button id={index}>삭제</button></td>
                                        <td>{input.option.productInfo.pcode}</td>
                                        <td>{input.option.productInfo.pname}</td>  
                                        <td>{input.option.opOptionName}</td>
                                        <td>{input.iquantity}</td>
                                        <td>{input.ireceivedDate}</td>
                                        <td>{input.option.productInfo.pprice}</td>
                                    </tr>
                                ))
                                /**<td>상품이름</td>
                                   <td>옵션</td>
                                   <td>수량</td>
                                   <td>배송지</td>
                                   <td>가격</td>
                                   <td>총가격</td>  이런 뜻을 가짐*/

                                        /**이 코드는 백에서 요청을 하면 옵션들을 끼워서 옵션 단위 별로 자세하게 나올수 있도록 표시를 해준다 */
                               }
                           </tbody>
                       </table>
                   </div>
               </div>
                ): null}
                {selectPage=="주문내역" ? (
                   <div className={`${styles.box}`}>
                   <div className={`${styles.order}`}>
                       <table className={`${styles.tabler}`}>
                           <thead>
                               <tr>
                                <th colspan="10">
                                    주문내역
                                </th>
                               </tr>
                           </thead>
                           <tbody>
                               <tr>
                                   <td>주문번호</td>
                                   <td>상세주문번호</td>
                                   <td>상품이름</td>
                                   <td>옵션</td>
                                   <td>수량</td>
                                   <td>배송지</td>
                                   <td>가격</td>
                                   <td>총가격</td>
                               </tr>
                               {/*여기에 주문 내역 가져와서 쫙 볼수있게 */}
                               {
                                orderProductDetail.map((order,index)=>(
                                    <tr key={index}>
                                        <td>{order.order.ocode}</td>
                                        <td>{order.odCode}</td>
                                        <td>{order.productInfo.pname}</td>  
                                        <td>{order.option.opOptionName}</td>
                                        <td>{order.odCount}</td>
                                        <td>{order.order.oaddress}</td>
                                        <td>{order.productInfo.pprice}</td>
                                        <td>{order.order.ototalprice}</td>
                                    </tr>
                                ))
                                /**<td>상품이름</td>
                                   <td>옵션</td>
                                   <td>수량</td>
                                   <td>배송지</td>
                                   <td>가격</td>
                                   <td>총가격</td>  이런 뜻을 가짐*/

                                        /**이 코드는 백에서 요청을 하면 옵션들을 끼워서 옵션 단위 별로 자세하게 나올수 있도록 표시를 해준다 */
                               }
                           </tbody>
                       </table>
                   </div>
               </div>
                ): null}
            </div>
            
            <div className={styles.footSection}>
            <hr></hr>
                <h1>Foot Section</h1>
                <Link to='/'><p>test</p></Link>
            </div>
        </>
    );
}