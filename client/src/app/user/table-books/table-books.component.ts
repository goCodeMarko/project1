import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PopUpModalComponent } from '../../modals/pop-up-modal/pop-up-modal.component';
import { HttpRequestService } from '../../http-request/http-request.service';
import { EditBookComponent } from '../../modals/edit-book/edit-book.component';

interface IBooks {
  author: string;
  stocks: number;
  isdeleted: boolean;
  _id: string;
  title: string;
  price: number
}

interface IResponse {
  success: string;
  data: IBooks[];
  code: number;
  message?: {
    error: { message: string };
  };
}

@Component({
  selector: 'app-table-books',
  templateUrl: './table-books.component.html',
  styleUrls: ['./table-books.component.css']
})
export class TableBooksComponent implements OnInit, OnChanges {
  @Input() books: IBooks[] = [];

  constructor(private dialog: MatDialog, private hrs: HttpRequestService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log(changes)
  }

  openDeleteModal(id: string) {
    this.dialog.open(PopUpModalComponent, {
      width: '350px',
      data: {
        deletebutton: true,
        title: "You're about to delete a book",
        message: 'This will <b>delete the book from the database</b> <br> are you sure about it?'
      }
    }).componentInstance.result.subscribe((data: boolean) => {
      if (data) this.deleteBook(id);
    })
  }

  openEditModal(book: object) {
    this.dialog.open(EditBookComponent, {
      width: '500px',
      data: {
        data: book
      }
    }).componentInstance.result.subscribe((newData: { save: boolean, newData: object }) => {
      console.log(newData)
      if (newData.save) this.editBook(book, newData);
    })
  }

  private editBook(oldData: any, newData: any) {
    this.hrs.request('put', 'book/editBook', { oldData, newData }, async (data: IResponse) => {
      if (data.success) {
        this.editCurrentBookInTable(oldData._id, newData);
      } else {
        if (data.message?.error.message == 'Restricted') {
          this.dialog.open(PopUpModalComponent, {
            width: '500px',
            data: {
              deletebutton: false,
              title: "Access Denied",
              message: 'Oops, It looks like you <b>dont have access</b> on this feature.'
            }
          })
        }
      }
    })
  }

  private deleteBook(id: string) {
    console.log('xxxxxx');

    this.hrs.request('put', 'book/deleteBook', { id }, async (data: IResponse) => {

      if (data.success) {
        this.deleteCurrentBookInTable(id);
      } else {

        if (data.message?.error.message == 'Restricted') {
          this.dialog.open(PopUpModalComponent, {
            width: '500px',
            data: {
              deletebutton: false,
              title: "Access Denied",
              message: 'Oops, It looks like you <b>dont have access</b> on this feature.'
            }
          })
        }
      }
    })
  }

  private deleteCurrentBookInTable(id: string) {
    this.books.splice(this.books.findIndex(book => book._id == id), 1);
  }

  private editCurrentBookInTable(id: string, edited: any) {
    console.log(edited)
    this.books.forEach((data, i) => {
      if (data._id == id) {
        this.books[i].author = edited.updateddata.author;
        this.books[i].title = edited.updateddata.title;
        this.books[i].stocks = edited.updateddata.stocks;
        this.books[i].price = edited.updateddata.price;
      }
    })
  }

}