# All files in the 'lib' directory will be loaded
# before nanoc starts compiling.

def html_escape(str)
  str.gsub('&', '&amp;').gsub('<', '&lt;').gsub('>', '&gt;').gsub('"', '&quot;')
end
alias h html_escape

def cart_badge(page)
  <<-CODE
    <div class="cart_badge">
      <div class="price">Стоимость: #{page[:model][:price]} р.</div>
      <a href="#" onclick="shopping_cart.addItem({name: '#{page[:title]}', quantity: 1, price: #{page[:model][:price]}}); return false;" class="add">Добавить в корзину</a>
    </div>
  CODE
end

def model_id(model)
  model[:path].split("/").last
end

def model_cover(model)
  "<img src='/photos/#{ model_id(model) }.jpg' alt='Фотографии #{ model[:title] }' class='cover' />"
end

def model_pictures(model)
  result = ""
  
  Dir["output/photos/#{ model_id(model) }/*.jpg"].sort.each_with_index do |picture, index|
    result << "<a href='#{picture.sub("output", "")}' rel='lightbox[roadtrip]'>#{ model_cover(model) if index == 0}</a>"
  end
  
  result = "<div class='pictures'>#{result}</div>"
end

def model_info(model)
  <<-CODE
    <table align="right">
      <tr><td><h3>Заказ</h3></td></tr>
      <tr>
        <td>#{ cart_badge(model) }</td>
      </tr>
      <tr><td><h3>Фотогалерея</h3></td></tr>
      <tr>
        <td>#{ model_pictures(model) }</td>
      </tr>
    </table>
  CODE
end