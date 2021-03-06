<template>
  <div class="reg-wrapper">
    <el-form v-if="formIndex===0" :model="codeForm" :rules="codeRules" ref="codeForm">
      <el-form-item prop="email">
        <el-input placeholder="邮箱" v-model="codeForm.email" clearable></el-input>
      </el-form-item>
      <el-form-item class="get-code-wrapper" prop="vcode">
        <el-input placeholder="输入6位验证码" v-model="codeForm.vcode"></el-input>
        <el-button
          type="primary"
          :disabled="ifDisabled"
          class="get-code"
          @click="getCheckCode()"
        >{{vcodeBtnName}}</el-button>
      </el-form-item>
      <el-form-item>
        <div class="user-pact">
          注册表示您同意遵守
          <a>《用户协议》</a>
        </div>
      </el-form-item>
      <el-button type="primary" class="btn-reg" @click="nextStep('codeForm')">下一步</el-button>
    </el-form>
    <!-- 添加用户信息表单 -->
    <el-form v-else :model="userForm" :rules="userRules" ref="userForm">
      <el-form-item prop="pwd">
        <el-input
          type="password"
          v-model="userForm.pwd"
          auto-complete="off"
          placeholder="请设置密码"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item prop="newpwd">
        <el-input
          type="password"
          v-model="userForm.newpwd"
          auto-complete="off"
          placeholder="请再次输入密码"
          clearable
        ></el-input>
      </el-form-item>
      <el-form-item prop="realName">
        <el-input placeholder="请填写真实姓名" v-model="userForm.realName" clearable></el-input>
      </el-form-item>
      <el-form-item prop="orgName">
        <el-input placeholder="请填写工作机构" v-model="userForm.orgName" clearable></el-input>
      </el-form-item>
      <el-button type="primary" class="btn-reg" @click="submitForm('userForm')">注册</el-button>
    </el-form>
  </div>
</template>
<script>
import { loginApi } from '@/service'
import { mapActions } from 'vuex'
import { email, password } from '@/utils/validate'
export default {
  name: 'VcodeForm',
  data () {
    var validatePassAgain = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'))
      } else if (value !== this.userForm.pwd) {
        callback(new Error('两次输入密码不一致'))
      } else if (!this.pattern.test(value) || value.length < 8 || value.length > 16) {
        callback(new Error('密码长度8-16位，包括字母和数字（区分大小写）'))
      } else {
        callback()
      }
    }
    return {
      kind: 'login',
      formIndex: 0, // 当前展示第几步
      formTitle: '平台注册',
      vcodeBtnName: '获取验证码', // 验证码登录获取验证码按钮名称
      redirect: '',
      timer: null, // 定时器
      duration: 60, // 倒计时长60s
      regMobile: /^1[3456789]\d{9}$/,
      pattern: /^(?![^a-zA-Z]+$)(?!\D+$)/,
      codeForm: {
        email: '404997046@qq.com', // 登录名-邮箱
        vcode: '948880' // 验证码
      },
      codeRules: {
        email: [email['required'], email['pattern']],
        vcode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 6, max: 6, message: '长度为6的数字', trigger: 'blur' }
        ]
      },
      userForm: {
        pwd: 'Aa111111', // 密码
        newpwd: 'Aa111111', // 再次输入密码
        realName: '余颖丽', // 真实姓名
        orgName: '科技发展' // 工作机构
      },
      userRules: {
        pwd: [password['required'], password['length'], password['pattern']],
        newpwd: [{ validator: validatePassAgain, trigger: 'blur' }],
        realName: [{ required: true, message: '请输入真实姓名', trigger: 'blur' }],
        orgName: [{ required: true, message: '请输入工作机构', trigger: 'blur' }] // 工作机构
      }
    }
  },
  mounted () {
    this.redirect = this.$route.query.redirect
  },
  computed: {
    // 获取验证码按钮的状态
    ifDisabled () {
      if (
        this.codeForm.email !== '' &&
        this.duration === 60
      ) {
        return false
      } else {
        return true
      }
    }
  },
  methods: {
    ...mapActions({
      login: 'logIn'
    }),
    nextStep (formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          this.formIndex = 1
          this.formTitle = '请完善信息'
          this.$emit('update', this.formTitle)
        }
      })
    },
    // 获取邮箱验证码
    async getCheckCode () {
      try {
        const totalDuration = this.duration // 记住倒计时总时长
        await loginApi.emailActive({
          email: this.codeForm.email
        })
        this.ifDisabled = true
        this.$Notify(`验证码已发送到您的邮箱：${this.codeForm.email}`, 'top-right')
        this.countDown(totalDuration)
      } catch (error) {
        console.log(error)
      }
    },

    // 倒计时
    countDown (totalDuration) {
      const that = this
      this.duration = this.duration - 1
      this.vcodeBtnName = `${this.duration}s`
      if (this.duration === 0) {
        this.duration = totalDuration
        this.ifDisabled = false
        this.vcodeBtnName = `重新发送`
        return
      }
      this.timer = setTimeout(function () {
        that.countDown(totalDuration)
      }, 1000)
    },

    // 登录注册调api
    submitForm (formName) {
      this.$refs[formName].validate(async (valid) => {
        if (valid) {
          try {
            const params = {
              ...this.codeForm,
              ...this.userForm
            }
            await loginApi.regByEmail(params)
            this.$message({
              message: '恭喜你注册成功,即将跳转至登录~',
              type: 'success'
            })
            setTimeout(this.$router.push({ path: '/login' }), 3000)
          } catch (e) {
            console.log(e)
            this.$message.error(e)
          }
        } else {
          console.log('error submit!!有必填项为空')
        }
      })
    },
    openMsg () {
      this.$confirm('注册成功！为了保障您账号的安全，请先设置密码~', '', {
        showClose: false,
        showCancelButton: true,
        center: true,
        confirmButtonText: '确定',
        cancelButtonText: '跳过'
      })
        .then(() => {
          this.$router.push({ path: '/setpwd' }) // 新用户验证码通过，去设置密码
        })
        .catch(() => {
          this.$router.push({ path: '/home/dashboard' }) // 已注册
        })
    }
  },
  beforeDestroy () {
    clearInterval(this.timer)
  }
}
</script>
<style lang='less' scoped>
.reg-wrapper {
  .btn-reg {
    font-size: 16px;
  }
  .user-pact {
    text-align: left;
    a {
      color: blue;
      text-decoration: underline;
    }
  }
}
</style>
