ShoppingCart = Class.create({
  options: {
    cartTemplate : new Template("<h2>#{cartHeader}</h2><table>#{items}</table><b>#{totalPrice}: #{total} #{currency}</b>"),
    itemTemplate : new Template("<tr><td>#{name}</td><td>#{quantity}</td><td>x</td><td>#{price} #{currency}</td><td><a href='#' onclick=\"$('#{element_id}').cart.removeAt(#{position})\">-</a></td></tr>"),
    labels : {
      currency    : "р.",
      cartHeader  : "Корзина заказов",
      totalPrice  : "Итого"
    }
  },
  
  initialize: function(element, args){
    this.store = new CookieJar({
      expires: 36000, // 10 hours
      path: "/"
    });
    
    this.element = $(element);
    this.element.cart = this;
    
    this.observe("items:change", this.show);
    this.observe("items:add", this.highlight);
    this.observe("items:remove", this.highlight);
  },
  
  show: function(){
    var items_html = "";
    var options = this.options;
    var items = this.getItems();
    
    for(i = 0; i < items.size(); i++){
      items_html = items_html.concat(this.renderItem(items[i]));
    }
    
    var cart_html = this.options.cartTemplate.evaluate($H({
      items: items_html,
      total: this.totalPrice()
    }).merge(options.labels));
    
    this.element.innerHTML = cart_html;
  },
  
  highlight: function(){
    new Effect.Highlight(this.element);
  },
  
  renderItem: function(item){
    var additional = $H({
      position: this.getItems().indexOf(item),
      element_id: this.element.id
    }).merge(this.options.labels);
    
    var html = this.options.itemTemplate.evaluate(
      $H(item).merge(additional)
    )
      
    return html;
  },
  
  getItems: function(){
    if(!Object.isArray(this.items)){
      var items_from_cookie = this.store.get("items");
      
      if(!Object.isArray(items_from_cookie)){
        this.items = [];
      } else {
        this.items = items_from_cookie;
      }
    }
    
    return this.items;
  },
  
  setItems: function(items) {
    this.store.put("items", items);
    this.items = items;
    
    this.fire("items:change");
  },
  
  addItem: function(new_item){
    var items = this.getItems();
    var stored = false;
    
    items.each(function(item){
      if(new_item.name == item.name) {
        item.quantity = item.quantity + new_item.quantity;
        
        stored = true;
      }
    });
    
    if(!stored){
      items.push(new_item);
    }
    
    this.setItems(items);
    
    this.fire("items:add");
  },
  
  removeAt: function(position) {
    var item = this.getItems()[position];
    if(item != undefined) {
      this.removeItem(item);
    }
  },
  
  removeItem: function(item){
    var items = this.getItems();
    var item_to_remove = null;
    
    items.each(function(i){
      if(i.name == item.name){
        item_to_remove = i;
      }
    });
    
    this.setItems(items.without(item_to_remove));
    
    this.fire("items:remove");
  },
  
  clear: function(){
    this.store.remove("items");
  },
  
  totalPrice: function(){
    var price = 0;
    
    this.getItems().each(function(item){
      price = price + item.price * item.quantity;
    });
    
    return price;
  },
  
  fire: function(eventName, memo) {
    memo = memo || { };
    memo.cart = this;
    return this.element.fire('cart:' + eventName, memo);
  },

  observe: function(eventName, handler) {
    this.element.observe('cart:' + eventName, handler.bind(this));
    return this;
  }
  
});