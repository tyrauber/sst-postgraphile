<template>
  <div class="container">
    <!--UPLOAD-->
    <form enctype="multipart/form-data" novalidate>
      <h1 v-html="title"></h1>
      <table>
        <tr v-for="(file, index) in files">
          <td v-html="file.url" style="width:100%"></td>
          <td v-html="file.file.type"></td>
          <td v-html="file.file.size"></td>
          <td v-html="file.percentage" style="width:140px;">0%</td>
        </tr>
      </table>
      <div class="dropbox" v-if="showDropZone">
        <input type="file" multiple :name="uploadFieldName" :disabled="!showDropZone" @drop="filesChange($event)" @change="filesChange($event);" id="input-file" class="input-file">
        <p>Drag your file(s) here to begin<br> or click to browse</p>
      </div>
    </form>
  </div>
</template>

<script>
  export default {
    name: 'app',
    data() {
      return {
        files: [],
        uploadFieldName: 'media',
        timer: false,
        transfer: false
      }
    },
    computed: {
      title(){
        return (this.total > 0) ? `Uploading ${this.total} images` : 'Upload images'
      },
      total(){
        return this.files.length
      },
      showDropZone(){
        return this.total == 0;
      }
    },
    watch: {
      transfer: function(n){
        if(this.files.length > 0){
          this.uploadFile(this.files[0]);
        }
      }
    },
    methods: {
      reset() {
        this.files = [];
      },
      setTimer(callback) {
        if(this.timer)
          clearTimeout(this.timer);
        this.timer = setTimeout(callback, 300);
      },
      setTransfer(){
        this.transfer = !this.transfer
      },
      async getUploadUrl(file) {
        return await this.$store.dispatch("current_user/upload", { params: { path: file.url, type: file.file.type } })
      },
      async uploadFile(file) {
        let uploadUrl = await this.getUploadUrl(file);
        let xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl.url, true);
        xhr.setRequestHeader('acl', 'public-read');
        xhr.onload = () => {
          if (xhr.status === 200) {
            this.files.shift();
            this.setTransfer();
          }
        };
        xhr.onerror = (err) => {
          console.log("err", err)
        };
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            let percentage = Math.round((event.loaded / event.total) * 100)
            file.percentage = percentage.toString()+"%";
          }
        };
        xhr.send(file.file);
      },
      filesChange(e){
        e.stopPropagation();
        e.preventDefault();
        if(e.dataTransfer && e.dataTransfer.items){
          var items = e.dataTransfer.items;
          for (var i=0; i<items.length; i++) {
            var item = items[i].webkitGetAsEntry();
            if (item) {
              this.addDirectory(item);
            }
          }
          return;
        }
        var files = e.target.files || e.dataTransfer.files;
        if (!files.length){
          return;
        }
        this.processFile('/', files);
        this.done = true;
      },
      addDirectory(item) {
        if (item.isDirectory) {
          var directoryReader = item.createReader();
          directoryReader.readEntries((entries) => {
          entries.forEach((entry) => {
              this.addDirectory(entry);
            });
          });
        } else {
          item.file((file) => {
            this.processFile(item.fullPath, [file],0);
          });
        }
      },
      processFile(path, files){
        files.forEach((file)=>{
          if (file.type.match(/(image\/jpeg|image\/jpg|image\/png|image\/gif)/)){
            this.files.push({url: path, file: file, percentage: '0%' })
            this.setTimer(this.setTransfer);
          } else {
            console.warn('File type not supported', file.type)
          }
        })
      }
    },
    async mounted() {
      this.reset();
      //let params = { path: 'hello_world.jpg' }
      // await this.$store.dispatch("current_user/upload", { params: params }).then(response => {
      //   console.log(response)
      // })
    },
  }

</script>

<style lang="scss">
  table tr td{
    padding-right: 20px;
  }
  .dropbox {
    outline: 2px dashed grey; /* the dash box */
    outline-offset: -10px;
    background: lightcyan;
    color: dimgray;
    padding: 10px 10px;
    min-height: 200px; /* minimum height */
    position: relative;
    cursor: pointer;
  }

  .input-file {
    opacity: 0; /* invisible but it's there! */
    left: 0px;
    right: 0px;
    width: 100%;
    height: 200px;
    position: absolute;
    cursor: pointer;
  }

  .dropbox:hover {
    background: lightblue; /* when mouse over to the drop zone, change color */
  }

  .dropbox p {
    font-size: 1.2em;
    text-align: center;
    padding: 50px 0;
  }
</style>