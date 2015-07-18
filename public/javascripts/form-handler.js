$(document).ready(function() {

  $('.search-dist').on('change', function() {
    console.log(this.value);
    console.log( $('.dist-bar .range-input').val());
    $('.dist-bar .range-input').val($(this).val());
  })

  $('.search-cost').on('change', function() {
    $('.cost-bar .range-input').val($(this).val());
  })

  $('.cost-bar .range-input').on('change', function() {
    $('.search-cost').val($(this).val());
  })

  $('.dist-bar .range-input').on('change', function() {
    $('.search-dist').val($(this).val());
  })

})
