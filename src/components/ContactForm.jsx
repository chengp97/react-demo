import React from 'react';
import { Field, reduxForm } from 'redux-form';
import { TextField, Button, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

const validate = values => {
  const errors = {};
  if (!values.name) {
    errors.name = '请输入姓名';
  }
  if (!values.email) {
    errors.email = '请输入邮箱';
  } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(values.email)) {
    errors.email = '无效的邮箱格式';
  }
  if (!values.message) {
    errors.message = '请输入留言内容';
  }
  return errors;
};

const useStyles = makeStyles((theme) => ({
  form: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  submitButton: {
    marginTop: theme.spacing(2),
  },
  fieldContainer: {
    position: 'relative',
    minHeight: '80px',
  },
}));

const renderTextField = ({ input, label, meta: { touched, error }, ...custom }) => {
  const classes = useStyles();
  return (
    <div className={classes.fieldContainer}>
      <TextField
        label={label}
        error={touched && error}
        helperText={touched && error ? error : ''}
        fullWidth
        variant="outlined"
        {...input}
        {...custom}
      />
    </div>
  )
};

const ContactForm = (props) => {
  const { handleSubmit, pristine, submitting } = props;
  const classes = useStyles();

  const onSubmit = (values) => {
    console.log('Form values:', values);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={classes.form}>
      <Typography variant="h5" gutterBottom>
        联系表单
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <Field
            name="name"
            component={renderTextField}
            label="姓名"
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            name="email"
            component={renderTextField}
            label="邮箱"
            type="email"
          />
        </Grid>
        <Grid item xs={12}>
          <Field
            name="message"
            component={renderTextField}
            label="留言"
            multiline
            rows={4}
          />
        </Grid>
        <Grid item xs={12}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={pristine || submitting}
            className={classes.submitButton}
            fullWidth
          >
            提交
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};

export default reduxForm({
  form: 'contact',
  validate
})(ContactForm);