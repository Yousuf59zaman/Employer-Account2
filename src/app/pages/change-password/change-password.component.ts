import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { InputComponent, InputType } from '../../components/Shared/input/input.component';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LocalstorageService } from '../../Services/shared/essentials/localstorage.service';
import { CompanyId, UserId, UserName } from '../../utils/app.const';
import { ChangePasswordService } from '../../Services/changePassword/change-password.service';
import { NgClass } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
type PasswordMatchStatus = 'empty' | 'match' | 'not-match';
type patternValidation = 'empty' | 'valid' | 'notValid';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [InputComponent, ReactiveFormsModule, NgClass],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.scss',
})
export class ChangePasswordComponent implements OnInit {

  toastr = inject(ToastrService)
  localStorageService = inject(LocalstorageService)
  changePassService = inject(ChangePasswordService)

  typeOldPass: InputType = 'password';
  typeNewPass: InputType = 'password';
  typeConfirmPass: InputType = 'password';


  companyId = this.localStorageService.getItem(CompanyId)
  userId = this.localStorageService.getItem(UserId)
  userName = this.localStorageService.getItem(UserName)

  // isSubmited = signal(false)
  showErrorMsgOldPass = signal(false);
  isOldPasswordMatch = signal(true);
  isOldPasswordEmpty = signal(true)
  isConfirmPassMatch = signal<PasswordMatchStatus>('empty');
  isOldPassPatternValid = signal<patternValidation>('empty');
  isNewPassPatternValid = signal<patternValidation>('empty');
  isConfirmPassPatternValid = signal<patternValidation>('empty');

  private isFirstTimeCheck = true; // Flag to track first-time check  


  ngOnInit(): void {
    this.oldPasswordControl().valueChanges.subscribe((val) => {
      this.isOldPasswordValid()
      // this.checkPatternValidity();
      // console.log(val, 'val');
      this.showErrorMsgOldPass.set(false)
      if (val === '') {
        this.isOldPasswordEmpty.set(true)
      }
      else {
        this.isOldPasswordEmpty.set(false)
      }
    })
    this.newPasswordControl().valueChanges.subscribe(() => {
      // this.checkPatternValidity();
      this.isNewPasswordValid()
      this.isPasswordMatch();
    })
    this.confirmPasswordControl().valueChanges.subscribe(() => {
      // this.checkPatternValidity()
      this.isConfirmPasswordValid()
      this.isPasswordMatch();
    })

  }

  showPassword(str: string) {
    if (str === 'typeOldPass') {
      this.typeOldPass === 'password' ? this.typeOldPass = 'text' : this.typeOldPass = 'password';
    }

    if (str === 'typeNewPass') {
      this.typeNewPass === 'password' ? this.typeNewPass = 'text' : this.typeNewPass = 'password';
    }

    if (str === 'typeConfirmPass') {
      this.typeConfirmPass === 'password' ? this.typeConfirmPass = 'text' : this.typeConfirmPass = 'password';
    }

  };


  updatePassForm = new FormGroup({
    oldPassword: new FormControl('', [Validators.required]),
    newPassword: new FormControl('', [
      Validators.pattern(/^[^'"%<>”&(),\s]*$/),
      Validators.required,
      Validators.maxLength(8),
    ]),
    confirmPassword: new FormControl('', [
      Validators.pattern(/^[^'"%<>”&(),\s]*$/),
      Validators.required,
      Validators.maxLength(8),
    ]),

  });

  oldPasswordControl = computed(() => {
    return this.updatePassForm.get('oldPassword') as FormControl
  })
  newPasswordControl = computed(() => {
    return this.updatePassForm.get('newPassword') as FormControl
  })

  confirmPasswordControl = computed(() => {
    return this.updatePassForm.get('confirmPassword') as any as FormControl
  })

  isPasswordMatch(): boolean {
    const pwd = this.newPasswordControl().value ?? '';
    const newPwd = this.confirmPasswordControl().value ?? '';

    // Check if either field is empty
    if (pwd.length === 0 || newPwd.length === 0) {
      this.isConfirmPassMatch.set('empty');
      return false;
    }

    if (pwd === newPwd) {
      this.isConfirmPassMatch.set('match');
      return true;
    }
    else {
      this.isConfirmPassMatch.set('not-match');
      return false;
    }
  }

  isOldPasswordValid(): boolean {
    const oldPasswd = this.oldPasswordControl().value ?? '';

    // Skip validation if empty
    if (!oldPasswd.trim()) {
      return true; // or false, depending on your requirement
    }

    const isValid = /^[^'"%<>”&(),\s]*$/.test(oldPasswd);

    if (!isValid) {
      this.isOldPassPatternValid.set('notValid')
      // console.log('Old password contains invalid characters (avoid \' " , % < > or spaces)');
    } else {
      this.isOldPassPatternValid.set('valid')
      // console.log('Old password is valid');
    }

    return isValid;
  }

  isNewPasswordValid(): boolean {
    const newPasswd = this.newPasswordControl().value ?? '';

    // Skip validation if empty
    if (!newPasswd.trim()) {
      return true; // or false, depending on your requirement
    }

    const isValid = /^[^'"%<>”&(),\s]*$/.test(newPasswd);

    if (!isValid) {
      this.isNewPassPatternValid.set('notValid')
      // console.log('New password contains invalid characters (avoid \' " , % < > or spaces)');
    } else {
      this.isNewPassPatternValid.set('valid')
      // console.log('New password is valid');
    }

    return isValid;
  }

  isConfirmPasswordValid(): boolean {
    const confirmPasswd = this.confirmPasswordControl().value ?? '';

    // Skip validation if empty
    if (!confirmPasswd.trim()) {
      return true; // or false, depending on your requirement
    }
    const isValid = /^[^'"%<>”&(),\s]*$/.test(confirmPasswd);

    if (!isValid) {
      this.isConfirmPassPatternValid.set('notValid')
      // console.log('Confirm password contains invalid characters (avoid \' " , % < > or spaces)');
    } else {
      this.isConfirmPassPatternValid.set('valid')
      // console.log('Confirm password is valid');
    }

    return isValid;
  }


  private resetValues() {
    this.showErrorMsgOldPass.set(false);
    this.isOldPasswordMatch.set(true);
    this.isOldPasswordEmpty.set(true)
    this.isConfirmPassMatch.set('empty');
    this.isOldPassPatternValid.set('empty');
    this.isNewPassPatternValid.set('empty');
    this.isConfirmPassPatternValid.set('empty');
  }

  updatePassword() {
    this.showErrorMsgOldPass.set(false);
    // this.isSubmited.set(true)
    // this.checkPatternValidity()
    this.isPasswordMatch()

    const passInformation = {
      companyId: this.companyId,
      userId: this.userId,
      userName: this.userName,
      oldPassword: this.oldPasswordControl().value,
      newPassword: this.newPasswordControl().value,
      confirmPassword: this.confirmPasswordControl().value
    }

    this.changePassService.changePassPost(passInformation).subscribe({
      next: (res) => {
        // console.log(res);
        if (!res.data || res.data === "Your old password does not match!") {
          // console.log('err msg ', res.data);
          this.showErrorMsgOldPass.set(true);
          this.isOldPasswordMatch.set(false);
          this.oldPasswordControl().setErrors({ 'invalid': true });

          // console.log("this.isConfirmPassMatch()", this.isConfirmPassMatch())

        }
        else if (res.data === "Password has been updated successfully!") {
          // console.log('done bro');
          this.resetValues()
          this.updatePassForm.reset()
          this.toastr.success('Password Change Successfully');

        }
      },
    });
  }

}
