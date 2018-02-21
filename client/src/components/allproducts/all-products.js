// product grid of all products for rent 

import React, { Component } from 'react';
import Product from '../product';
import ProductPanel from '../productpanel';
// import '../App.css';
import logo from '../../assets/img/recre-entals-black.gif';
// import Product from '../product';
import './all-products.css';

import API from '../../utils/API';

class AllProducts extends Component{

    state = {
        categories: [],
        categoryCount: []
    }

    componentDidMount() {
        console.log('Making call');
        let categorylist = [];
        let categorynum = [];
        API.getCategoriesWithCount().then((data) => {
            console.log(data.data);
            for (let i=0; i<data.data.count.length; i++) {
                categorylist.push(data.data.rows[i]);
                categorylist[i].display = false;
                categorynum.push(data.data.count[i].count);
            }

           

            this.setState({
                categories: categorylist,
                categoryCount: categorynum
            }, () => {
                console.log(this.state);

            });
        });

    }

    productClick(event) {
        const index = parseInt(event.target.id.slice(8,event.target.id.length));

        let data = this.state.categories;

        if (data[index].display === true) {
            data[index].display = false;
        }
        else {
            data[index].display = true;
        }

        this.setState({
            categories: data
        });

       
    }



    allCategoryDisplay() {
        var rows = [];
        for(let i = 0; i<this.state.categories.length; i++) {
            rows.push(<div id={this.state.categories[i]}>
                        <h2 className="align-center">
                            <span 
                                className='category' 
                                onClick={this.productClick.bind(this)}
                                id={'category' + i}>
                            {this.state.categories[i].category}({this.state.categoryCount[i]})
                            </span>
                        </h2>
                        {this.state.categories[i].display ? 
                        <ProductPanel category={this.state.categories[i].category}/> : ''}
                    </div>);
        }

        return rows;
    }

    authenticate () {
       API.checkAuth().then((data) => {
           
         if(!data.data.auth) {
             alert('You must be signed in to add a product for rent.');
         }
         else {
             this.props.history.push({
                 pathname: '/newproduct'
             })
         }
       });
    }


    render(){
        return(
            <div className="container products">
                <h1>
                    Products By Category </h1>
                    <button 
                        style={{'float': 'right'}}
                        onClick={this.authenticate.bind(this)}><i className="fas fa-plus"></i> Add Product</button>
                {this.allCategoryDisplay()}
            </div>
        );
    }
}

export default AllProducts;