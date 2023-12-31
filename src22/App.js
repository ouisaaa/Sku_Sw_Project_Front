import './App.css';

import Main from './component/Main';
import Test from './component/Test';

import Login from'./component/Login';
import SignUp from './component/SignUp';
import Seller from './component/Seller';
import ProductDetail from './component/ProductDetail';
import Order from './component/Order';

import 'bootstrap/dist/css/bootstrap.min.css';

import {BrowserRouter,Route,Routes} from 'react-router-dom';

function App() {
  return (
   <BrowserRouter>
    <Routes>
      {/* <Route path='/'element={<Test/>}></Route> */}
      <Route path='/main/:category'element={<Main/>}>
      </Route>
      <Route path='/login'element={<Login/>}>
      </Route>
      <Route path='/signup'element={<SignUp/>}>
      </Route>
      <Route path='/seller'element={<Seller/>}>
      </Route>
      <Route path='/ProductDetail/:p_code'element={<ProductDetail/>}>
      </Route>
      <Route path='/Order/:m_code'element={<Order/>}>
      </Route>
      <Route path='/Order/:p_code'state='{ product: productBuy }'element={<Order/>}>
      </Route>
    </Routes>
   </BrowserRouter>
  );
}

export default App;
