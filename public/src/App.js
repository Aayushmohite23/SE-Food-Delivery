import React from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import HomePage from "./pages/HomePage";
import Cart from "./pages/Cart";

function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<HomePage/>}/>
				<Route path="/cart" element={<Cart/>}/>
			</Routes>
		</BrowserRouter>
	);	
}

export default App;
