

class FeedHandler {
    constructor() {
        this.posts = JSON.parse(localStorage.getItem('posts')) || [];
    }


    addPost(formData, formType) {
        const newPost = {
            id: this.posts.length > 0 ? Math.max(...this.posts.map(p => p.id)) + 1 : 1,
            type: formType,
            timeStamp: new Date().toISOString(), 
            username: "JohnDoe", 
            ...formData
        };
        this.posts.unshift(newPost);
        this.savePosts();
        return newPost;
    }

    
    savePosts() {
        localStorage.setItem('posts', JSON.stringify(this.posts));
    }

    // Get all posts
    getAllPosts() {
        return this.posts;
    }

   
    getPostsByType(type) {
        return this.posts.filter(post => post.type === type);
    }
}





class FormHandler {
    constructor(formId, formType) {
        this.form = document.getElementById(formId);
        this.formType = formType;
        this.feedHandler = new FeedHandler();
        this.setupFormSubmission();
    }

    collectFormData() {
        const formData = {};
        const formElements = this.form.elements;

        for (let element of formElements) {
            if (element.id && element.value) {
                if (element.type === 'file') {
                    const file = element.files[0];
                    if (file) {
                        formData[element.id] = URL.createObjectURL(file);
                    }
                } else {
                    formData[element.id] = element.value;
                }
            }
        }
        return formData;
    }

    validateForm() {
        let isValid = true;
        const requiredFields = Array.from(this.form.querySelectorAll('[required]'));

        requiredFields.forEach(field => {
            if (!field.value) {
                field.classList.add('invalid');
                isValid = false;
            } else {
                field.classList.remove('invalid');
            }
        });

        return isValid;
    }

    setupFormSubmission() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!this.validateForm()) {
                alert('Please fill all required fields!');
                return;
            }

            const formData = this.collectFormData();
            this.feedHandler.addPost(formData, this.formType);

            alert('Form submitted successfully!');
            window.location.href = 'feed.html';
        });
    }
}