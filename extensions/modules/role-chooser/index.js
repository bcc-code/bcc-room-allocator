import{ref as e,computed as l,resolveComponent as o,openBlock as r,createBlock as t,withCtx as i,createVNode as a,createElementVNode as n,createElementBlock as s,Fragment as u,renderList as c,unref as d,toDisplayString as v,createCommentVNode as m,createTextVNode as f}from"vue";import{useApi as p}from"@directus/extensions-sdk";const h={class:"flex flex-wrap"},k={key:0},_=f(" Select ");var y={name:"module",setup(f){const y=e([]),C=e([]),g=e(""),x=e(null),b=l((()=>C.value?y.value.filter((e=>C.includes(e.id))):y.value)),w=p();return w.get("/users/me",{params:{fields:["role","roles.role"]}}).then((({data:e})=>{g.value=e.data.role,C.value=e.data.roles?.map((e=>e.role))})),w.get("/roles",{params:{fields:["id","name","icon","description"]}}).then((({data:e})=>{y.value=e.data})),(e,l)=>{const f=o("v-error"),p=o("v-button"),y=o("v-info"),C=o("private-view");return r(),t(C,{title:"Choose role",id:"role-chooser"},{default:i((()=>[a(f,{error:x.value,onClick:l[0]||(l[0]=e=>x.value=null)},null,8,["error"]),n("div",h,[(r(!0),s(u,null,c(d(b),(e=>(r(),t(y,{key:e.id,icon:e.icon,title:e.name,style:{margin:"1rem"}},{default:i((()=>[e.description?(r(),s("p",k,v(e.description),1)):m("v-if",!0),a(p,{disabled:e.id===g.value,onClick:l=>async function(e){console.log(e);try{await w.patch("/users/me",{role:e.id}),location.reload()}catch(e){x.value=e}}(e)},{default:i((()=>[_])),_:2},1032,["disabled","onClick"])])),_:2},1032,["icon","title"])))),128))])])),_:1})}},__file:"src/module.vue"},C={id:"role-chooser",name:"Role Chooser",icon:"security",routes:[{path:"",component:y}],preRegisterCheck(e,l){if(e.role.admin_access)return!0;return!!l.find((e=>"directus_users"===e.collection&&"update"===e.action&&e.fields.includes("role")))}};export{C as default};
