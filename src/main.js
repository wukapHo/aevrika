// Описание задачи:
// Исправить и дополнить приложение Список задач,
// в функционал которого входит:
// 1) Добавление новых задач;
// 2) Отображение списка задач;
// 3) Фильтрация задач по статусу;
// 4) Удаление элементов из списка задач;
// 5) Получение задач из удалённого хранилища при инициализации приложения
// (https://my-json-server.typicode.com/falk20/demo/todos);

// От вас требуется:
// 1. Доработать приложение в соответствии с заявленным функционалом.
// 2. Описать ваши изменения в коде комментариями.
// Изменять код можно как душа пожелает.

// Заменил require на import; заглавная буква в начале
import Vue from 'vue';

// Во всем коде заменил zadachi на todos
// Изменил порядок свойств экземпляра (template переместил в самый конец)
// Добавил пустую строку между многострочными свойствами для лучшей читаемости
window.app = new Vue({
  el: '#app',

  data() {
    return {
      // Переименовал innerData в todoList
      todoList: {
        todos: [],
        // Переименовал activeFilter в filter
        filter: 'all',
      },

      // Переименовал value в newTodo, изменил дефолтное значение  на пустую строку
      newTodo: '',
    };
  },

  // Добавил computed свойства для фильтрации задач
  computed: {
    activeTodos() {
      return this.todoList.todos.filter(item => item.active === true);
    },

    completedTodos() {
      return this.todoList.todos.filter(item => item.active !== true);
    },
  },

  // Переписал запрос на сервер с использованием async/await
  async created() {
    const res = await fetch(
      'https://my-json-server.typicode.com/falk20/demo/todos',
    );
    const todosData = await res.json();
    // Добавил this.todoList. для доступа к todos
    this.todoList.todos = todosData;
  },

  // Вынес обращение к инпуту в хук mounted
  mounted() {
    // Заменил неработающий метод .getElementById() на вьюшные ref'ы
    this.$refs.todoInput.focus();
  },

  methods: {
    // Переименовал метод с todo на add, аргумент c t на todo
    add(todo) {
      // Добавил проверку на пустую строку в инпуте, если строка пустая, инпут берется в фокус
      if (todo === '') {
        this.$refs.todoInput.focus();
        return;
      }

      // Добавил сборку новой задачи в объект для приведения к одному виду с
      //    теми задачами, которые приходят из удаленного хранилища
      const todoToAdd = {
        id: Date.now(),
        text: this.newTodo,
        active: true,
      };

      // Добавил this.todoList для доступа к todos, переписал способ добавления новой задачи
      this.todoList.todos = [...this.todoList.todos, todoToAdd];
      // Добавил сброс значения инпута после добавления новой задачи
      this.newTodo = '';
    },

    remove(todo) {
      // Переписал способ удаления задачи из списка через метод массива .filter(),
      //    переименовал аргумент из t в todo
      const todos = this.todoList.todos.filter(item => item.id !== todo.id);
      // Изменил способ присваивания нового массива в переменную
      this.todoList.todos = todos;
    },

    // Убрал метод настройки фильтра, логику перенес в темплейт
  },

  /*
    В темплейте:
    - заменил v-bind:value в инпуте на v-model для двустороннего связывания
    - добавил инпуту обработку нажатия клавиши Enter
    - добавил инпуту плейсхолдер
    - исправил сравнения на строгие
    - привел элементы отступами и переносами строк в более читаемый вид
    - избавился от одновременного использования на одном элементе директив v-for и v-if,
          добавив вычисляемые свойства для фильтрации задач
    - в элементах, где используется v-for добавил :key
    - заменил v-on: на короткую запись @
    - заменил обращение к несуществующему полю todo.name на todo.text
    - удалил непонятные "1212" из элемента с фильтром "Все"
    - заменил фильтр в условии отрисовки элемента с "Все" на "all"
    - в элементе задачи заменил div с обработкой клика для удаления на button,
          добавил чекбокс переключения активности задачи
    - заменил корневой элемент с div на section
    - добавил немного стилей, дабы глаза не так сильно резало
  */
  template: `
    <section class="container">
      <input
        ref="todoInput"
        v-model="newTodo"
        class="new-todo"
        placeholder="Введите задачу..."
        @keydown.enter="add(newTodo)"
      />
      <button
        class="add-todo"
        @click="add(newTodo)"
      >
        Добавить задачу
      </button>

      <div>
        <span
          class="filter"
          :class="[ todoList.filter === 'all' ? 'filter-active' : '' ]"
          @click="todoList.filter = 'all'"
        >
          Все
        </span>
        <span
          class="filter"
          :class="[ todoList.filter === 'active' ? 'filter-active' : '' ]"
          @click="todoList.filter = 'active'"
        >
          Активные
        </span>
        <span
          class="filter"
          :class="[ todoList.filter === 'completed' ? 'filter-active' : '' ]"
          @click="todoList.filter = 'completed'"
        >
          Завершенные
        </span>
      </div>

      <div
        v-if="todoList.filter === 'active'"
        class="todo-list"
      >
        <div
          v-for="todo in activeTodos"
          :key="todo.id"
          class="todo-item active"
        >
          <div class="checkbox-wrapper">
            <input
              type="checkbox"
              :checked="!todo.active"
              @change="todo.active = !todo.active"
            />
            {{ todo.text }}
          </div>

          <div>
            <button @click="remove(todo)">
              Удалить
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="todoList.filter === 'all'"
        class="todo-list"
      >
        <div
          v-for="todo in todoList.todos"
          :key="todo.id"
          class="todo-item"
          :class="todo.active ? 'active' : 'completed'"
        >
          <div class="checkbox-wrapper">
            <input
              type="checkbox"
              :checked="!todo.active"
              @change="todo.active = !todo.active"
            />
            {{ todo.text }}
          </div>

          <div>

            <button @click="remove(todo)">
              Удалить
            </button>
          </div>
        </div>
      </div>

      <div
        v-if="todoList.filter === 'completed'"
        class="todo-list"
      >
        <div
          v-for="todo in completedTodos"
          :key="todo.id"
          class="todo-item completed"
        >
          <div class="checkbox-wrapper">
            <input
              type="checkbox"
              :checked="!todo.active"
              @change="todo.active = !todo.active"
            />
            {{ todo.text }}
          </div>

          <div>
            <button @click="remove(todo)">
              Удалить
            </button>
          </div>
        </div>
      </div>
    </section>
  `,
});
