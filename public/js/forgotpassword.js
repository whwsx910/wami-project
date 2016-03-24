function forgotpw() {
  if ($('#email').val() === '') {
    $('#errorMsg').html('Invalid email');
    $('#errorAlert').removeClass('hidden');
    $('#errorAlert').removeClass('alert-success');
    $('#errorAlert').addClass('alert-danger');
  }
  else {
    $.post("/users/verifyemail", {
        email: $('#email').val()
      })
      .done(function(data) {
        if (data.success) {
          $('#errorMsg').html('Email sent!');
          $('#errorAlert').removeClass('hidden');
          $('#errorAlert').removeClass('alert-danger');
          $('#errorAlert').addClass('alert-success');
        }else{
          $('#errorMsg').html(data.error);
          $('#errorAlert').removeClass('hidden');
          $('#errorAlert').removeClass('alert-success');
          $('#errorAlert').addClass('alert-danger');
        }
      });
  }
}
