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
                            altText
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
    }).then(data => reduceData(data))
        .catch(error => console.error(error))
}

function firstProductOutput(product, featuredDescription) {
    let productHtml = `
    <article class="card left-card">
        <a href="${product.node.path}">
            <div class="card-img-container">
                <img src="${product.node.defaultImage.url}" alt="${product.node.defaultImage.altText}">
            </div>
        </a>
        <div class="card-body">
            <div class="card-text">
                <h4 class="card-title">
                    <a href="${product.node.path}">${product.node.name}</a>
                </h4>

                <div class="card-summary">
                    ${featuredDescription}

                    <a href="${product.node.path}">Learn More »</a>
                </div>
            </div>
        </div>
    </article>`

    document.getElementById('firstProductOutput').innerHTML = productHtml;
}

function centerProductOutputs(product, featuredDescription) {
    let productHtml = `
    <article class="card center-column">
        <a href="${product.node.path}">
            <div class="card-img-container">
                <img src="${product.node.defaultImage.url}" alt="${product.node.defaultImage.altText}">
            </div>
        </a>
        <div class="card-body">
            <div class="card-text">
                <h4 class="card-title">
                    <a href="${product.node.path}">${product.node.name}</a>
                </h4>

                <div class="card-summary" data-test-info-type="price">
                    ${featuredDescription}
                    <a href="${product.node.path}">Learn More »</a>
                </div>
            </div>
        </div>
    </article>`

    document.getElementById('centerProductsOutput').innerHTML += productHtml;
}

function rightProductOutputs(product, index, featuredDescription) {
    let productHtml = `
    <article class="card right-list">
        <div class="card-body">
            <div class="card-text">
                <h4 class="card-title">
                    <a href="${product.node.path}">${product.node.name}</a>
                </h4>
                <div class="card-summary" data-test-info-type="price">
                    ${featuredDescription}
                    <br>
                    <a href="${product.node.path}">Learn More »</a>
                </div>
            </div>
        </div>
    </article>`

    switch (index) {
    case 3:
    case 4:
    case 5:
    case 6:
        document.getElementById('rightProductsOutput1').innerHTML += productHtml;
        break;
    case 7:
    case 8:
    case 9:
    case 10:
        document.getElementById('rightProductsOutput2').innerHTML += productHtml;
        break;
    }
}

/**
 *
 * @param product
 * @param featuredDescription
 */
function mobileProductsOutput(product, featuredDescription) {
    let productHtml = `
    <article class="card right-list">
        <div class="card-body">
            <div class="card-text">
                <h4 class="card-title">
                    <a href="${product.node.path}">${product.node.name}</a>
                </h4>
                <div class="card-summary" data-test-info-type="price">
                    ${featuredDescription}
                    <br>
                    <a href="${product.node.path}">Learn More »</a>
                </div>
            </div>
        </div>
    </article>`

    document.getElementById('mobileFeaturedProducts').innerHTML += productHtml;
}

/**
 *
 * @param customFields
 * @returns {string}
 */
function getFeaturedDescriptionValue(customFields) {
    return customFields.edges.map(
        (node) => getFeaturedDescription(node)
    ).toString();
}

/**
 *
 * @param node
 * @returns {*}
 */
function getFeaturedDescription(node) {
    if (node.node.name === "featured_description") {
        return node.node.value;
    }
}

/**
 *
 * @param data
 * @returns {void[]}
 */
function reduceData(data) {
    return data.data.site.featuredProducts.edges.map(
        (node, index) => productOutput(node, index)
    );
}

/**
 *
 * @param product
 * @param index
 */
function productOutput(product, index) {
    let featuredDescriptionValue = getFeaturedDescriptionValue(product.node.customFields);

    mobileProductsOutput(product, featuredDescriptionValue);

    switch (index) {
    case 0:
        firstProductOutput(product, featuredDescriptionValue);
        break;
    case 1:
    case 2:
        centerProductOutputs(product, featuredDescriptionValue);
        break;
    case 3:
    case 4:
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
        rightProductOutputs(product, index, featuredDescriptionValue)
        break;
    default:
        break;
    }
}
