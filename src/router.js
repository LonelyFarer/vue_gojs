import Vue from 'vue'
import Router from 'vue-router'
import triangle from '@/components/triangle'
Vue.use(Router)

export default new Router({
    mode: 'history',
    routes: [
        {
            path: '/',
            name: '',
            component: resolve => require(['./views/useGoDiagramWorkflow'], resolve),
            meta: { scrollToTop: true }
        },
        {
            path: '/workflow2',
            name: '',
            component: resolve => require(['./views/useGoDiagramWorkflow2'], resolve),
            meta: { scrollToTop: true }
        },
        {
            path: '/tree_layout',
            name: '',
            component: resolve => require(['./views/useGoDiagramTreeLayout'], resolve),
            meta: { scrollToTop: true }
        },
        {
            path: '/sandglass',
            name: '',
            component: resolve => require(['./views/usesandglass'], resolve),
            meta: { scrollToTop: true }
        },
        {
            path: '/gojs',
            name: '',
            component: resolve => require(['./views/gojs'], resolve),
            meta: { scrollToTop: true }
        },
        {
            path: '/triangle',
            name: 'triangle',
            component: triangle
        }
    ]
})
