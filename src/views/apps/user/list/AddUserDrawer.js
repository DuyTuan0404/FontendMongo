
import { useState, useEffect } from 'react'

// ** MUI Imports
import Drawer from '@mui/material/Drawer'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import { styled } from '@mui/material/styles'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import Radio from '@mui/material/Radio'
import RadioGroup from '@mui/material/RadioGroup'
import FormControlLabel from '@mui/material/FormControlLabel'

// ** Custom Component Import
import CustomTextField from 'src/@core/components/mui/text-field'

// ** Third Party Imports
import * as yup from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Controller } from 'react-hook-form'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { fetchCities } from 'src/store/apps/city'
import { fetchDistricts } from 'src/store/apps/district'
import { fetchWards } from 'src/store/apps/ward'

// ** Actions Imports
import { addUser } from 'src/store/apps/user'

const showErrors = (field, valueLen, min) => {
  if (valueLen === 0) {
    return `${field} field is required`
  } else if (valueLen > 0 && valueLen < min) {
    return `${field} must be at least ${min} characters`
  } else {
    return ''
  }
}

const Header = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(6),
  justifyContent: 'space-between'
}))



const UserDrawer = props => {
  // ** Props
  const { open, toggle, user, mode = 'add', onSubmit: onSubmitProp } = props

  // ** State
  const [plan, setPlan] = useState(user?.currentPlan || 'basic')
  const [role, setRole] = useState(user?.role || 'subscriber')
  const [avatarInputType, setAvatarInputType] = useState('upload') // 'upload' | 'imageLink' | 'videoLink'
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarError, setAvatarError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)


  // ** Hooks
  const dispatch = useDispatch()
  const store = useSelector(state => state.user)
  const cities = useSelector(state => state.city.data)
  const districts = useSelector(state => state.district.data)
  const wards = useSelector(state => state.ward.data)

  // Khai báo defaultValues ở đầu file, trước mọi hook
  const defaultValues = {
    email: 'tuantruong@gmail.com',
    company: 'tuan truongtruong',
    billing: 'Auto Debit',
    fullName: 'tuan truongtruong',
    username: 'tuan truongtruong',
    name: 'tuan truongtruong',
    note: 'tuan truongtruong',
    msisdn: '0919115743',
    password: '12345678',
    passwordConfirm: '12345678',
    avatarColor: '',
    avatar: '',
    city: '6768ddf9447496e1789dfe79',
    district: '6768e5ff22f90677ec400ae4',
    ward: '676902c96d1cfb590c1e2ceb',
    status: 'active'
  }

  // Khai báo schema ở đầu file, trước khi khai báo useForm
  const schema = yup.object().shape({
    company: yup.string().required(),
    billing: yup.string().required(),
    email: yup.string().email().required(),
    msisdn: yup
      .string()
      .required('Phone is required')
      .matches(/^[0-9]{10,12}$/, 'Phone must be from 10 to 12 digits'),
    fullName: yup
      .string()
      .min(3, obj => showErrors('First Name', obj.value.length, obj.min))
      .required(),
    username: yup
      .string()
      .min(3, obj => showErrors('Username', obj.value.length, obj.min))
      .required(),
    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),
    passwordConfirm: yup
      .string()
      .oneOf([yup.ref('password'), null], 'Passwords must match')
      .required('Please confirm your password'),
    status: yup.string().required(),
    city: yup.string().required(),
    district: yup.string().required(),
    ward: yup.string().required(),
  })

  // 1. Khai báo useForm trước
  const {
    reset,
    control,
    setValue,
    setError,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm({
    defaultValues: defaultValues,
    mode: 'onChange',
    resolver: yupResolver(schema)
  })

  // 2. Sau đó mới được dùng control trong useEffect
  useEffect(() => {
    dispatch(fetchCities())
  }, [dispatch])

  const cityValue = watch('city')
  const districtValue = watch('district')

  useEffect(() => {
    if (cityValue) {
      // Tìm object city theo _id, lấy id để fetch district
      const cityObj = Array.isArray(cities.data) ? cities.data.find(c => (c._id || c.id) === cityValue) : null
      const cityId = cityObj ? cityObj.id : cityValue
      dispatch(fetchDistricts(cityId))
      setValue('district', '')
      setValue('ward', '')
    }
  }, [cityValue, cities.data, dispatch, setValue])

  useEffect(() => {
    if (districtValue) {
      // Tìm object district theo _id, lấy id để fetch ward
      const districtObj = Array.isArray(districts.data) ? districts.data.find(d => (d._id || d.id) === districtValue) : null
      const districtId = districtObj ? districtObj.id : districtValue
      dispatch(fetchWards(districtId))
      setValue('ward', '')
    }
  }, [districtValue, districts.data, dispatch, setValue])

  // Nếu là edit, lấy defaultValues từ user, nếu không thì dùng defaultValues mặc định
  const isEdit = mode === 'edit'

  // Reset form khi user hoặc open thay đổi (edit)
  useEffect(() => {
    if (isEdit && user) {
      reset({
        ...defaultValues,
        ...user,
        password: '',
        passwordConfirm: ''
      })
      setPlan(user.currentPlan || 'basic')
      setRole(user.role || 'subscriber')
    } else if (!isEdit && open) {
      reset(defaultValues)
      setPlan('basic')
      setRole('subscriber')
    }
  }, [user, open, isEdit, reset])

  // Ánh xạ avatarInputType sang số
  const avatarTypeMap = {
    upload: 0,
    imageLink: 1,
    videoLink: 2
  }

  const handleFormSubmit = data => {
    const submitData = {
      ...data,
      avatar_type: avatarTypeMap[avatarInputType],
      currentPlan: plan
    }

    if (submitData.avatar_type === 0 && submitData.avatar instanceof File) {
      const formData = new FormData()
      Object.entries(submitData).forEach(([key, value]) => {
        formData.append(key, value)
      })
      // Log toàn bộ FormData

      dispatch(addUser(formData))
    } else {
      dispatch(addUser(submitData))
    }
  }

  const handleClose = () => {
    setPlan('basic')
    setRole('subscriber')
    setValue('contact', Number(''))
    toggle()
    reset()
  }

  const avatarValue = watch ? watch('avatar') : null

  const handleAvatarTypeChange = e => {
    const type = e.target.value
    setAvatarInputType(type)
    // Reset avatar khi đổi type
    setValue('avatar', '')
    setAvatarPreview(null)
    setAvatarError('')
  }

  const handleFileChange = e => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setAvatarError('File phải là ảnh (jpg, png, jpeg, gif, webp...)')
        setAvatarPreview(null)
        setValue('avatar', '')
        return
      }
      setAvatarError('')
      setValue('avatar', file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  useEffect(() => {
    if (avatarInputType === 'imageLink' && typeof avatarValue === 'string') {
      if (avatarValue && !imageUrlRegex.test(avatarValue)) {
        setAvatarError('Link phải là ảnh online hợp lệ (jpg, png, jpeg, gif, webp)')
        setAvatarPreview(null)
      } else {
        setAvatarError('')
        setAvatarPreview(avatarValue || null)
      }
    }
    if (avatarInputType === 'videoLink' && typeof avatarValue === 'string') {
      if (avatarValue && !youtubeUrlRegex.test(avatarValue)) {
        setAvatarError('Chỉ nhận link YouTube hợp lệ')
      } else {
        setAvatarError('')
      }
    }
    // eslint-disable-next-line
  }, [avatarInputType, avatarValue])

  const imageUrlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/i
  const youtubeUrlRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/

  return (
    <Drawer
      open={open}
      anchor='right'
      variant='temporary'
      onClose={handleClose}
      ModalProps={{ keepMounted: true }}
      sx={{ '& .MuiDrawer-paper': { width: { xs: 300, sm: 400 }, display: 'flex', flexDirection: 'column' } }}
    >
      {/* Header cố định */}
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          backgroundColor: '#fff',
          borderColor: 'divider'
        }}
      >
        <Header>
          <Typography variant='h5'>Add User</Typography>
          <IconButton
            size='small'
            onClick={handleClose}
            sx={{
              p: '0.438rem',
              borderRadius: 1,
              color: 'text.primary',
              backgroundColor: 'action.selected',
              '&:hover': {
                backgroundColor: theme => `rgba(${theme.palette.customColors.main}, 0.16)`
              }
            }}
          >
            <Icon icon='tabler:x' fontSize='1.125rem' />
          </IconButton>
        </Header>
      </Box>
      {/* Form cuộn */}
      <Box sx={{ flex: 1, overflowY: 'auto', px: 6 }}>
        <form id='add-user-form' onSubmit={handleSubmit(handleFormSubmit)}>
          <Controller
            name='name'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Name'
                onChange={onChange}
                placeholder='Enter Name'
                error={Boolean(errors.name)}
                {...(errors.name && { helperText: errors.name.message })}
              />
            )}
          />
          <Controller
            name='fullName'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='FullName'
                onChange={onChange}
                placeholder='Enter Full Name'
                error={Boolean(errors.fullName)}
                {...(errors.fullName && { helperText: errors.fullName.message })}
              />
            )}
          />
          <Controller
            name='username'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Username'
                onChange={onChange}
                placeholder='Enter username'
                error={Boolean(errors.username)}
                {...(errors.username && { helperText: errors.username.message })}
              />
            )}
          />
          <Controller
            name='email'
            control={control}
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                type='email'
                label='Email'
                value={value}
                sx={{ mb: 4 }}
                onChange={onChange}
                error={Boolean(errors.email)}
                placeholder='Enter Email'
                {...(errors.email && { helperText: errors.email.message })}
              />
            )}
          />

          {/* Avatar type selection and input fields moved up here */}
          <RadioGroup name='type' row value={avatarInputType} onChange={handleAvatarTypeChange}>
            <FormControlLabel value='upload' control={<Radio />} label='Upload' />
            <FormControlLabel value='imageLink' control={<Radio />} label='Image Link' />
            <FormControlLabel value='videoLink' control={<Radio />} label='Video' />
          </RadioGroup>
          {avatarInputType === 'upload' && (
            <Controller
              name='avatar'
              control={control}
              render={({ field: { onChange } }) => (
                <Box sx={{ mb: 1 }}>
                  <Button variant='outlined' component='label'>
                    Upload Image
                    <input
                      type='file'
                      accept='image/*'
                      hidden
                      onChange={e => {
                        const file = e.target.files[0]
                        onChange(file)
                        setAvatarPreview(file ? URL.createObjectURL(file) : null)
                        setAvatarError('')
                      }}
                    />
                  </Button>
                  {avatarError && <Typography color='error'>{avatarError}</Typography>}
                </Box>
              )}
            />
          )}
          {avatarInputType === 'imageLink' && (
            <Controller
              name='avatar'
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  value={typeof value === 'string' ? value : ''}
                  sx={{ mb: 1 }}
                  label='Image Link'
                  onChange={onChange}
                  placeholder='Enter image URL'
                  error={!!avatarError}
                  helperText={avatarError}
                />
              )}
            />
          )}
          {avatarInputType === 'videoLink' && (
            <Controller
              name='avatar'
              control={control}
              render={({ field: { value, onChange } }) => (
                <CustomTextField
                  fullWidth
                  value={typeof value === 'string' ? value : ''}
                  sx={{ mb: 1 }}
                  label='Video Link'
                  onChange={onChange}
                  placeholder='Enter YouTube URL'
                  error={!!avatarError}
                  helperText={avatarError}
                />
              )}
            />
          )}
            <Box sx={{ mb: 2 }}>
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Avatar Type
            </Typography>
            <Box sx={{ mb: 2 }}>
              {avatarInputType === 'upload' && (
                <img
                  src={avatarPreview || '/images/avatars/default.png'}
                  alt='Avatar'
                  style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              {avatarInputType === 'imageLink' && avatarPreview && !avatarError && (
                <img
                  src={avatarPreview}
                  alt='Avatar'
                  style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover' }}
                />
              )}
              {avatarInputType === 'videoLink' && avatarValue && youtubeUrlRegex.test(avatarValue) && !avatarError && (
                <Box sx={{ width: 200, height: 120 }}>
                  <iframe
                    width='200'
                    height='120'
                    src={`https://www.youtube.com/embed/${avatarValue.split('v=')[1] || ''}`}
                    title='YouTube video'
                    frameBorder='0'
                    allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
                    allowFullScreen
                  />
                </Box>
              )}
            </Box>
          </Box>
          <Controller
              name='status'
              control={control}
              render={({ field: { value = 'active', onChange } }) => (
                <CustomTextField
                  select
                  fullWidth
                  sx={{ mb: 4 }}
                  label='Status'
                  value={value}
                  onChange={onChange}
                  error={Boolean(errors.status)}
                  {...(errors.status && { helperText: errors.status.message })}
                >
                  <MenuItem value=''>Select Status</MenuItem>
                  <MenuItem value='pending'>Pending</MenuItem>
                  <MenuItem value='active'>Active</MenuItem>
                  <MenuItem value='inactive'>Inactive</MenuItem>
                </CustomTextField>
              )}
            />
          <Controller
            name='msisdn'
            control={control}
            rules={{ required: true, minLength: 10, maxLength: 12 }}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                type='number'
                sx={{ mb: 4 }}
                label='Phone'
                onChange={onChange}
                placeholder='Enter Phone'
                error={Boolean(errors.msisdn)}
                {...(errors.msisdn && { helperText: errors.msisdn.message })}
              />
            )}
          />

          <Controller
            name='company'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Company'
                onChange={onChange}
                placeholder='Enter Company'
                error={Boolean(errors.company)}
                {...(errors.company && { helperText: errors.company.message })}
              />
            )}
          />
          <Controller
            name='billing'
            control={control}
            render={({ field: { value = 'Auto Debit', onChange } }) => (
              <CustomTextField
                select
                fullWidth
                sx={{ mb: 4 }}
                label='Billing'
                value={value}
                onChange={onChange}
                error={Boolean(errors.billing)}
                {...(errors.billing && { helperText: errors.billing.message })}
              >
                <MenuItem value=''>Select Billing</MenuItem>
                <MenuItem value='Auto Debit'>Auto Debit</MenuItem>
                <MenuItem value='Manual - Cash'>Manual - Cash</MenuItem>
                <MenuItem value='Manual - Paypal'>Manual - Paypal</MenuItem>
                <MenuItem value='Manual - Credit Card'>Manual - Credit Card</MenuItem>
              </CustomTextField>
            )}
          />



          <Controller
            name='avatarColor'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Avatar Color'
                onChange={onChange}
                placeholder='Enter Avatar Color'
                error={Boolean(errors.avatarColor)}
                {...(errors.avatarColor && { helperText: errors.avatarColor.message })}
              />
            )}
          />
          <Controller
            name='city'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                select
                fullWidth
                sx={{ mb: 4 }}
                label='City'
                value={value}
                onChange={onChange}
                error={Boolean(errors.city)}
                {...(errors.city && { helperText: errors.city.message })}
              >
                <MenuItem value=''>Select City</MenuItem>
                {Array.isArray(cities.data) && cities.data.map(city => (
                  <MenuItem key={city._id || city.id} value={city._id || city.id}>{city.name}</MenuItem>
                ))}
              </CustomTextField>
            )}
          />
          <Controller
            name='district'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                select
                fullWidth
                sx={{ mb: 4 }}
                label='District'
                value={value}
                onChange={onChange}
                error={Boolean(errors.district)}
                {...(errors.district && { helperText: errors.district.message })}
              >
                <MenuItem value=''>Select District</MenuItem>
                {Array.isArray(districts.data) && districts.data.map(district => (
                  <MenuItem key={district._id || district.id} value={district._id || district.id}>{district.name}</MenuItem>
                ))}
              </CustomTextField>
            )}
          />
          <Controller
            name='ward'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                select
                fullWidth
                sx={{ mb: 4 }}
                label='Ward'
                value={value}
                onChange={onChange}
                error={Boolean(errors.ward)}
                {...(errors.ward && { helperText: errors.ward.message })}
              >
                <MenuItem value=''>Select Ward</MenuItem>
                {Array.isArray(wards.data) && wards.data.map(ward => (
                  <MenuItem key={ward._id || ward.id} value={ward._id || ward.id}>{ward.name}</MenuItem>
                ))}
              </CustomTextField>
            )}
          />



          <CustomTextField
            select
            fullWidth
            sx={{ mb: 6 }}
            label='Select Plan'
            SelectProps={{ value: plan, onChange: e => setPlan(e.target.value) }}
          >
            <MenuItem value='basic'>Basic</MenuItem>
            <MenuItem value='company'>Company</MenuItem>
            <MenuItem value='enterprise'>Enterprise</MenuItem>
            <MenuItem value='team'>Team</MenuItem>
          </CustomTextField>

          <Controller
            name='note'
            control={control}
            render={({ field: { value, onChange } }) => (
              <CustomTextField
                fullWidth
                value={value}
                sx={{ mb: 4 }}
                label='Note'
                onChange={onChange}
                placeholder='Enter Note'
                multiline
                minRows={3}
                maxRows={3}
              />
            )}
          />
          {!isEdit && (
            <>
              <Controller
                name='password'
                control={control}
                rules={{ required: true, minLength: 6 }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    type={showPassword ? 'text' : 'password'}
                    value={value}
                    sx={{ mb: 4 }}
                    label='Password'
                    onChange={onChange}
                    placeholder='Enter Password'
                    error={Boolean(errors.password)}
                    {...(errors.password && { helperText: errors.password.message })}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          edge='end'
                          onClick={() => setShowPassword(v => !v)}
                          tabIndex={-1}
                        >
                          <Icon icon={showPassword ? 'tabler:eye-off' : 'tabler:eye'} fontSize='1.25rem' />
                        </IconButton>
                      )
                    }}
                  />
                )}
              />
              <Controller
                name='passwordConfirm'
                control={control}
                rules={{ required: true, minLength: 6 }}
                render={({ field: { value, onChange } }) => (
                  <CustomTextField
                    fullWidth
                    type={showPasswordConfirm ? 'text' : 'password'}
                    value={value}
                    sx={{ mb: 4 }}
                    label='Confirm Password'
                    onChange={onChange}
                    placeholder='Confirm Password'
                    error={Boolean(errors.passwordConfirm)}
                    {...(errors.passwordConfirm && { helperText: errors.passwordConfirm.message })}
                    InputProps={{
                      endAdornment: (
                        <IconButton
                          edge='end'
                          onClick={() => setShowPasswordConfirm(v => !v)}
                          tabIndex={-1}
                        >
                          <Icon icon={showPasswordConfirm ? 'tabler:eye-off' : 'tabler:eye'} fontSize='1.25rem' />
                        </IconButton>
                      )
                    }}
                  />
                )}
              />
            </>
          )}
        </form>
      </Box>
      {/* Nút bấm cố định */}
      <Box
        sx={{
          position: 'sticky',
          bottom: 0,
          zIndex: 2,
          backgroundColor: '#fff',
          borderColor: 'divider',
          px: 6,
          py: 3
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Button type='submit' variant='contained' sx={{ mr: 3 }} form='add-user-form'>
            Submit
          </Button>
          <Button variant='tonal' color='secondary' onClick={handleClose}>
            Cancel
          </Button>
        </Box>
      </Box>
    </Drawer>
  )
}

export default UserDrawer
