/*
 Import all product specific js
 */
import PageManager from './page-manager';
import Review from './product/reviews';
import collapsibleFactory from './common/collapsible';
import ProductDetails from './common/product-details';
import videoGallery from './product/video-gallery';
import { classifyForm } from './common/form-utils';

export default class Product extends PageManager {
    constructor(context) {
        super(context);
        this.url = window.location.href;
        this.$reviewLink = $('[data-reveal-id="modal-review-form"]');
        this.$bulkPricingLink = $('[data-reveal-id="modal-bulk-pricing"]');
    }

    onReady() {
        this.addHtmlContent();

        // Listen for foundation modal close events to sanitize URL after review.
        $(document).on('close.fndtn.reveal', () => {
            if (this.url.indexOf('#write_review') !== -1 && typeof window.history.replaceState === 'function') {
                window.history.replaceState(null, document.title, window.location.pathname);
            }
        });

        const originalMaxHeight = $('.readmore-box').css('max-height');
        this.readMore(originalMaxHeight);

        // Init collapsible
        collapsibleFactory();

        this.productDetails = new ProductDetails($('.productView'), this.context, window.BCData.product_attributes);
        this.productDetails.setProductVariant();

        videoGallery();

        const $reviewForm = classifyForm('.writeReview-form');
        const review = new Review($reviewForm);

        $('body').on('click', '[data-reveal-id="modal-review-form"]', () => {
            validator = review.registerValidation(this.context);
        });

        $reviewForm.on('submit', () => {
            if (validator) {
                validator.performCheck();
                return validator.areAll('valid');
            }

            return false;
        });

        this.productReviewHandler();
        this.bulkPricingHandler();
    }

    readMore(originalHeight) {
        // @todo prevent screen from "Bouncing" on click
        const readMore = $('.read-more');
        const readMoreButton = $('.read-more_button');
        const readMoreBox = readMore.parent();

        if (parseInt(readMoreBox.css('height')) < 420) {
            readMore.css('display', 'none');
        }

        $(readMore).click(() => {
            if (originalHeight === readMoreBox.css('max-height')) {
                readMoreBox.animate({
                    'max-height': 9999,
                });

                readMoreButton.html('Read Less');
            } else {
                readMoreBox.animate({
                    'max-height': originalHeight,
                });

                readMoreButton.html('Read More');
            }

            return false;
        });
    }

    productReviewHandler() {
        if (this.url.indexOf('#write_review') !== -1) {
            this.$reviewLink.trigger('click');
        }
    }

    bulkPricingHandler() {
        if (this.url.indexOf('#bulk_pricing') !== -1) {
            this.$bulkPricingLink.trigger('click');
        }
    }

    addHtmlContent() {
        let htmlContentType = [
            'testimonials',
            'suggested-use'
        ];

        htmlContentType.forEach((type) => {
            this.productAjaxHtml(type);
        });
    }

    productAjaxHtml(type) {
        let strippedUrl = this.url.match(/\/([^\/]+)\/?$/)[1];
        let testimonialHtml = '<h3>What People Are Saying</h3>';
        let fdaHtml = '<div class="fda-text"><p>*These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease.</p></div>';
        let suggestedHtml = '<h3>Suggested Use</h3>';

        $.ajax({
            url: '/content/product_data/'+ type + '/' + strippedUrl + '.html',
            success: (data) => {
                if (type === 'testimonials') {
                    document.getElementById(type).innerHTML = testimonialHtml + data + fdaHtml;
                } else if (type === 'suggested-use') {
                    document.getElementById(type).innerHTML = suggestedHtml + data;
                } else {
                    document.getElementById(type).innerHTML = '';
                }
            },
            cache: false,
            error: (xhr, ajaxOptions, thrownError) => {
                if (xhr.status == 404) {
                    return '';
                }
            }
        });
    }
}
