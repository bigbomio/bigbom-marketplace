import React from 'react';
import PropTypes from 'prop-types';

const Product = ({ match, data }) => {
    var product = data.find(p => p.id === Number(match.params.productId));
    var productData;

    if (product)
        productData = (
            <div className="productDetail">
                <h1> {product.name} </h1>
                <p>{product.description}</p>
                <hr />
                <h4>{product.status}</h4>
            </div>
        );
    else productData = <h2> Sorry. Product does not exist </h2>;

    return <div className="products">{productData}</div>;
};

Product.propTypes = {
    match: PropTypes.object.isRequired,
    data: PropTypes.array.isRequired
};

export default Product;
