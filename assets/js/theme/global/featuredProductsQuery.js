import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';

const GET_FEATURED_PRODUCTS = gql`
    query FeaturedProductsQuery {
        site {
            featuredProducts (first: 11) {
                pageInfo {
                    startCursor
                    endCursor
                }
                edges {
                    cursor
                    node {
                        entityId
                        path
                        name
                        customFields (names: "featured_description") {
                            edges {
                                node {
                                    entityId
                                    name
                                    value
                                }
                            }
                        }
                        defaultImage {
                            url (width: 200)
                        }
                    }
                }
            }
        }
    }`;

export default function (token) {
    getFeaturedProducts(token);
}

function getFeaturedProducts(token) {
    const client = new ApolloClient({ headers: { 'Authorization': `Bearer ${token}` }, });

    client.query({
        query: GET_FEATURED_PRODUCTS
    }).then(data => putInPage(data))
        .catch(error => console.error(error))
}

function putInPage(data) {
    let reducedData = reduceData(data)

    document.getElementById('test123').innerHTML = reducedData;

    //console.log(data);

    //reduceData(data);
}

function reduceData(data) {
    return data.data.site.featuredProducts.edges.map(
        node => productOutput(node)
    ).reduce((productsHtml, productHtml) => productsHtml += productHtml);
}

function productOutput(product) {
    return `
    <h1>${product.node.name}</h1>`
}
