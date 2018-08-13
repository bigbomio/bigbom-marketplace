import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Link, Route } from 'react-router-dom';
import Product from './Product';

class Products extends PureComponent {
    render() {
        const { match } = this.props;
        const productsData = [
            {
                id: 1,
                name: 'NIKE Liteforce Blue Sneakers',
                description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin molestie.',
                status: 'Available'
            },
            {
                id: 2,
                name: 'U.S. POLO ASSN. Slippers',
                description: 'Mauris finibus, massa eu tempor volutpat, magna dolor euismod dolor.',
                status: 'Available'
            },
            {
                id: 3,
                name: 'ADIDAS Adispree Running Shoes',
                description: 'Maecenas condimentum porttitor auctor. Maecenas viverra fringilla felis, eu pretium.',
                status: 'Available'
            },
            {
                id: 4,
                name: 'Lee Cooper Mid Sneakers',
                description: 'Ut hendrerit venenatis lacus, vel lacinia ipsum fermentum vel. Cras.',
                status: 'Out of Stock'
            }
        ];
        return (
            <div className="productsWrap">
                <div className="siderbar">
                    <h3>Categories products</h3>
                    {productsData.length && (
                        <ul className="list-products">
                            {productsData.map((route, key) => {
                                return (
                                    <Route key={key} path={`${match.url}/${route.id}`}>
                                        {prop => (
                                            <li className={prop.match ? 'curr' : null}>
                                                <Link to={`${match.url}/${route.id}`}>{route.name}</Link>
                                            </li>
                                        )}
                                    </Route>
                                );
                            })}
                        </ul>
                    )}
                </div>
                <Route path={`${match.url}/:productId`} render={props => <Product data={productsData} {...props} />} />
                <Route exact path={match.url} render={() => <div style={{ textAlign: 'center' }}>Please select a product.</div>} />
            </div>
        );
    }
}

Products.propTypes = {
    match: PropTypes.object.isRequired
};

export default Products;
