_.templateSettings.variable = "productdata"; //setting a template variable for productdatascore.js templates

var app = app || {};

var formupdated = false;



var colorChart = [{"name":"green","hexcode":"#A3D2A1"},{"name":"yellow","hexcode":"#F9F8E6"},{"name":"pink","hexcode":"#F1DDEF"},{"name":"red","hexcode":"#ED99A8"},{"name":"blue","hexcode":"#1169BD"}];

var sizeChart = [{"name":"small","code":"s"},{"name":"medium","code":"m"},{"name":"large","code":"l"},{"name":"extra large","code":"xl"}];



app.shoppingBag = (function () {

    var items = []; //private variable to hold the JSON
     
    getData = function(data){
        items = data;
    }
    
    //method for setting the default template of shopping cart
    populateProducts = function () {
		
        var compileTemplate = _.template($('#productTemplate').html()), html = compileTemplate({items: items});
		$('#productList').html(html);
        
        if($(window).innerWidth() <= 767){
            $('header h2 .num_class').remove(); 
            $('header h2').append($('.num_class'));
        } //changing position of some of the element in mobile as provided in the design
        
        editProduct();
        removeFromCart();
        addDiscount(items);
		
    };
    
    
    //event listener for edit link in shopping cart
    editProduct = function () {
            $('.edit').on('click', function (e) {
            e.preventDefault();
            var ind = $(this).attr('data-pid'), compileTemplate = _.template($('#editProductTemplate').html()), html = compileTemplate({item: items[ind]});
		    $('#tempModal .modal-body').html(html);
            $('#tempModal').modal('show'); //using bootstrap-modal to create the modal
            $('select').selectpicker({style: 'btn-default'});// use of bootstrap select to match the overlay dropdown
			
			if($(window).innerWidth() <= 767){$('.product-overlay-left').insertAfter($('.product-overlay-right'));} 
			updateToCart();            
        });
    }
    
    //event listener for edit link in the modal window
    updateToCart = function () {
        // on submit update to cart
        $('#update-product').on('click', function(){
            $('.errorText').removeClass('show'); 
            
            /*get values from form*/  
            var itemId = Number($('#modalItemPid').val());
            var newSize = $('#size-options').val();            
            var getColor = $('.product-color-selected.active').attr('data-bg-code'),newColor;
            var newQuantity = $('#select-qty').val();
            
            if(newSize.length && getColor.length && newQuantity.length){
               getColor = _.filter(colorChart,function(c){ return c.name == getColor;})[0];
               newSize = _.filter(sizeChart,function(c){ return c.code == newSize;})[0];
               
                //now change those item which has been modified, rest of the item will be as it is
                _.each(items,function(item,idx){
                    if(item.p_id == itemId){
                        item.p_selected_color = getColor;
                        item.p_selected_size = newSize;
                        item.p_price = item.p_price/item.p_quantity * newQuantity; //calculate the price
                        item.p_quantity = newQuantity;                        
                    }
                });
                
                populateProducts(); //updated on cart
                $('#tempModal').modal('hide'); //hide the modal as the cart has been plotted 
            }else{
               $('.errorText').addClass('show');               
            }            
        });
    }
    
    //on click product should removed from cart and update price accordingly
    removeFromCart = function () {
        $('.remove').on('click', function (e) {
			
			e.preventDefault();
			var ind = $(this).attr('data-pid'),compileTemplate,html;
            items.splice(ind,1);
            compileTemplate = _.template($('#productTemplate').html());
            html = compileTemplate({items: items});
            $('#productList').html(html);
            editProduct();
            removeFromCart();
            addDiscount(items);
			if(items.length === 0){
				$('#productList').html("Your cart is Empty! Continue shopping to add products");				
			}
			
			
        });
            
    }
     
	// add discounts according to requirement;	 
    addDiscount = function (items) {
        var discount = 0, discountsObj= {}, totalPrice, compileTemplate, html;
        var totalItems = _.reduce(_.pluck(items, "p_quantity"),function (m,i) {return Number(m) + Number(i); }, 0);// calculated by total number of quantity
        
		/*
			3 items in cart - 5% discount on subtotal amount
			3-6 items in cart - 10% discount on subtotal amount
			Above 10 items in cart – 25% discount on subtotal amount

		*/
        if (totalItems === 3){ discount = 5; }
        if (totalItems > 3 && items.length<=6){discount = 10;}
        if (totalItems > 6 && items.length<=9){discount = 20;}
        if (totalItems >= 10){ discount =25;}
        
        discountsObj.totalPrice = _.reduce(_.pluck(items, "p_price"),function (m,i) {return m + i; }, 0); //sum of the total price
        discountsObj.discountCode = discount;
        discountsObj.discount = discountsObj.totalPrice * discount / 100;
        discountsObj.finalAmmount = discountsObj.totalPrice - discountsObj.discount;
        
        compileTemplate = _.template($('#discountTemplate').html());
		html = compileTemplate(discountsObj);
		$('#checkoutDiscounts').html(html);
        
        //changing position of some of the element in mobile as provided in the design 
        if($(window).innerWidth() <= 767){$('#checkoutDiscounts .list-group-item:nth-child(2)').insertAfter($('#checkoutDiscounts .list-group-item:nth-child(3)'));} 
    }
    
    /*mislanious functionality */
	app.miscellaneousFunc = {
    
		//get the selected color from overlay and update it on cart
		activate : function (div) {
			$(div).closest('.color-selection').find('.product-color-selected').removeClass('active');
			$(div).addClass('active');
			$('.product-image').css({"background-color": $(div).css("background-color")});
			formupdated = true;
			if(formupdated == true && $('#update-product').text()==='EDIT'){
				$('#update-product').text('ADD TO BAG');
			}
		},
    
		//adding a 0 if price is between 1-9
		formatCurrency : function (v) {
			//console.log(v);
			v = v + '';
			if (v.length > 1) {
				return v;
			} else {
				return '0' + v;
			}
		}
	};
    
    return {
		 getData:getData,
		 populateProducts:populateProducts
	};
})();


$(function (){
    
    $.getJSON( "data/cart.json", function( data ) { 
        app.shoppingBag.getData(data.productsInCart);
        app.shoppingBag.populateProducts(data.productsInCart);
    });
    
    //changing position of some of the element in mobile as provided in the design 
    if($(window).innerWidth() <= 767){
        $('.bottomCheckoutGroup a').insertAfter('.bottomCheckoutGroup button');
        $('.bottomCheckoutGroup p img').insertAfter('.bottomCheckoutGroup p span');        
    }
	
	
    
});